import type {
    AdminAction,
    DashboardSnapshot,
    KeyService,
    Reservation,
    ReservationRequest,
    Role,
    ServiceEvent,
    TeamMember,
} from '../types/domain';
import { can, canManageMember } from '../permissions/access';
import { addMinutes, localNow, parseLocal } from '../services/date-time';
import { blockApplies, keyStatus, memberStatus } from '../services/selectors';
import { enforceRules, validateBlock, validateRules } from '../services/rules';
import { createDemoSnapshot } from './fixtures';
export type DemoScenario =
    | 'ready'
    | 'empty'
    | 'error'
    | 'loading'
    | 'commit-error';
export interface DemoOptions {
    role?: Role;
    actorId?: number;
    clock?: () => Date;
    latency?: number;
    initial?: DashboardSnapshot;
}
function delay(signal?: AbortSignal, duration = 120): Promise<void> {
    return new Promise((resolve, reject) => {
        if (signal?.aborted)
            return reject(new DOMException('Aborted', 'AbortError'));
        const abort = () => {
            clearTimeout(timer);
            signal?.removeEventListener('abort', abort);
            reject(new DOMException('Aborted', 'AbortError'));
        };
        const timer = setTimeout(() => {
            signal?.removeEventListener('abort', abort);
            resolve();
        }, duration);
        signal?.addEventListener('abort', abort, { once: true });
    });
}
function nextId(items: { id: number }[]): number {
    return Math.max(0, ...items.map((item) => item.id)) + 1;
}
export function createDemoService(
    scenario: DemoScenario = 'ready',
    options: DemoOptions = {},
): KeyService {
    const clock = options.clock ?? (() => new Date());
    const now = () => localNow(clock());
    let data = structuredClone(
        options.initial ?? createDemoSnapshot(clock(), options.role),
    );
    const actorId = options.actorId ?? data.currentUser.id;
    if (scenario === 'empty')
        data = {
            ...data,
            keys: [],
            spaces: [],
            reservations: [],
            movements: [],
            team: [],
        };
    let sequence = 0;
    let pending: {
        id: string;
        label: string;
        deadline: number;
        action: AdminAction;
        preview: DashboardSnapshot;
        timer: ReturnType<typeof setTimeout>;
    } | null = null;
    const listeners = new Set<(event: ServiceEvent) => void>();
    const actor = (snapshot = data): TeamMember => {
        const user =
            snapshot.team.find((member) => member.id === actorId) ??
            snapshot.currentUser;
        if (
            !user ||
            memberStatus(user, now()) !== 'active' ||
            user.role === 'unauthorized'
        )
            throw new Error('Seu acesso está suspenso ou sem permissão.');
        return user;
    };
    const view = (): DashboardSnapshot => {
        const snapshot = structuredClone(pending?.preview ?? data);
        snapshot.referenceDate = now();
        const user =
            snapshot.team.find((member) => member.id === actorId) ??
            snapshot.currentUser;
        snapshot.currentUser = {
            ...user,
            role:
                memberStatus(user, now()) === 'active'
                    ? user.role
                    : 'unauthorized',
        };
        snapshot.team.forEach((member) => {
            member.status = memberStatus(member, now());
        });
        snapshot.pendingChange = pending
            ? {
                  id: pending.id,
                  label: pending.label,
                  deadline: pending.deadline,
              }
            : null;
        return snapshot;
    };
    const emit = (message?: string, error?: string) => {
        const event = { snapshot: view(), message, error };
        listeners.forEach((listener) => listener(event));
    };
    const availableToOperate = () => {
        if (!can(actor().role, 'operate'))
            throw new Error('Você não pode movimentar chaves.');
        if (pending)
            throw new Error('Aguarde a alteração pendente ou use Desfazer.');
    };
    const validatePeriod = (
        request: ReservationRequest,
        ignoredReservation?: number,
    ): { start: string; key: DashboardSnapshot['keys'][number] } => {
        availableToOperate();
        const key = data.keys.find((item) => item.id === request.keyId);
        if (!key || !key.active)
            throw new Error(
                'Esta chave não está disponível para movimentação.',
            );
        const current = now();
        const start =
            request.mode === 'now' ? current : (request.startsAt ?? '');
        const from = parseLocal(start),
            to = parseLocal(request.endsAt);
        if (!Number.isFinite(from) || !Number.isFinite(to))
            throw new Error(
                'Informe datas válidas e horários entre 00:00 e 23:59.',
            );
        if (to <= from)
            throw new Error('A devolução prevista deve ser depois do início.');
        if (from < parseLocal(current) || to <= parseLocal(current))
            throw new Error('Escolha um período que ainda não passou.');
        if (!request.purpose.trim())
            throw new Error('Informe a finalidade da retirada.');
        if (request.mode === 'now' && keyStatus(key, data, now()) === 'in_use')
            throw new Error('Esta chave já está em uso.');
        if (blockApplies(key.block, start, request.endsAt))
            throw new Error(`Esta chave está bloqueada: ${key.block?.reason}`);
        enforceRules(data.globalRules, start, request.endsAt, actorId);
        enforceRules(key.rules, start, request.endsAt, actorId);
        if (
            data.reservations.some(
                (item) =>
                    item.id !== ignoredReservation &&
                    item.keyId === key.id &&
                    ['approved', 'checked_out'].includes(item.status) &&
                    from < parseLocal(item.endsAt) &&
                    to > parseLocal(item.startsAt),
            )
        )
            throw new Error(
                'Já existe um agendamento ou retirada neste período. Escolha outro horário.',
            );
        return { start, key };
    };
    const applyAdmin = (
        source: DashboardSnapshot,
        action: AdminAction,
    ): DashboardSnapshot => {
        const user = actor(source);
        const candidate = structuredClone(source);
        if (action.type === 'team-access') {
            if (!can(user.role, 'manageTeam'))
                throw new Error('Você não pode gerenciar a equipe.');
            const target = candidate.team.find(
                (member) => member.id === action.userId,
            );
            if (!target || !canManageMember(user.role, target))
                throw new Error(
                    'Você não pode alterar pessoas de nível superior.',
                );
            if (
                !['supervisor', 'admin', 'bolsista', 'unauthorized'].includes(
                    action.role,
                )
            )
                throw new Error('Cargo inválido.');
            if (
                user.role === 'admin' &&
                !['bolsista', 'unauthorized'].includes(action.role)
            )
                throw new Error(
                    'Administradores só podem conceder ou remover o cargo de bolsista.',
                );
            const rank: Record<Role, number> = {
                unauthorized: 0,
                bolsista: 1,
                admin: 2,
                supervisor: 3,
            };
            if (target.id === user.id && rank[action.role] > rank[user.role])
                throw new Error(
                    'Você não pode aumentar seus próprios privilégios.',
                );
            if (
                action.status === 'suspended' &&
                action.suspendedUntil &&
                (!Number.isFinite(parseLocal(action.suspendedUntil)) ||
                    parseLocal(action.suspendedUntil) <= parseLocal(now()))
            )
                throw new Error(
                    'A suspensão temporária deve terminar no futuro.',
                );
            Object.assign(target, {
                role: action.role,
                status:
                    action.role === 'unauthorized' ? 'revoked' : action.status,
                suspendedUntil:
                    action.status === 'suspended'
                        ? action.suspendedUntil
                        : null,
            });
            if (
                !candidate.team.some(
                    (member) =>
                        member.role === 'supervisor' &&
                        memberStatus(member, now()) === 'active',
                )
            )
                throw new Error('Mantenha pelo menos um supervisor ativo.');
        } else {
            if (!can(user.role, 'manageKeys'))
                throw new Error('Você não pode gerenciar chaves.');
            if (action.type === 'global-rules') {
                validateRules(action.rules);
                candidate.globalRules = structuredClone(action.rules);
            } else if (action.type === 'save-key') {
                const draft = action.value;
                if (!draft.code.trim() || !draft.name.trim())
                    throw new Error('Informe o código e o nome da chave.');
                if (
                    candidate.keys.some(
                        (key) =>
                            key.id !== action.keyId &&
                            key.code.toLocaleLowerCase() ===
                                draft.code.trim().toLocaleLowerCase(),
                    )
                )
                    throw new Error('Já existe uma chave com este código.');
                validateRules(draft.rules);
                validateBlock(draft.block, now());
                let spaceId = draft.spaceId;
                if (draft.newSpace) {
                    if (!draft.newSpace.name.trim())
                        throw new Error('Informe o nome da sala.');
                    spaceId = nextId(candidate.spaces);
                    candidate.spaces.push({ ...draft.newSpace, id: spaceId });
                } else if (
                    spaceId !== null &&
                    !candidate.spaces.some((space) => space.id === spaceId)
                )
                    throw new Error('Selecione uma sala válida.');
                const values = {
                    code: draft.code.trim(),
                    name: draft.name.trim(),
                    description: draft.description.trim(),
                    spaceId,
                    rules: structuredClone(draft.rules),
                    block: structuredClone(draft.block),
                };
                if (action.keyId !== undefined) {
                    const key = candidate.keys.find(
                        (item) => item.id === action.keyId,
                    );
                    if (!key || !key.active)
                        throw new Error(
                            'Esta chave está arquivada ou não existe.',
                        );
                    Object.assign(key, values);
                } else
                    candidate.keys.push({
                        id: nextId(candidate.keys),
                        active: true,
                        ...values,
                    });
            } else {
                const key = candidate.keys.find(
                    (item) => item.id === action.keyId,
                );
                if (!key || !key.active)
                    throw new Error('Esta chave está arquivada ou não existe.');
                if (action.type === 'archive-key') {
                    if (
                        candidate.reservations.some(
                            (item) =>
                                item.keyId === key.id &&
                                item.status === 'checked_out',
                        )
                    )
                        throw new Error('Devolva a chave antes de arquivar.');
                    if (
                        candidate.reservations.some(
                            (item) =>
                                item.keyId === key.id &&
                                item.status === 'approved' &&
                                parseLocal(item.endsAt) > parseLocal(now()),
                        )
                    )
                        throw new Error(
                            'Cancele os agendamentos futuros antes de arquivar.',
                        );
                    key.active = false;
                } else {
                    validateBlock(action.block, now());
                    key.block = structuredClone(action.block);
                }
            }
        }
        return candidate;
    };
    const service: KeyService = {
        async load(signal) {
            await delay(
                signal,
                scenario === 'loading' ? 60_000 : (options.latency ?? 120),
            );
            if (scenario === 'error')
                throw new Error(
                    'Não foi possível carregar o cenário demonstrativo.',
                );
            return view();
        },
        async reserve(request, signal) {
            await delay(signal, options.latency ?? 120);
            const { start } = validatePeriod(request);
            const user = actor();
            const reservation: Reservation = {
                id: nextId(data.reservations),
                keyId: request.keyId,
                operatorId: user.id,
                registration: user.registration,
                startsAt: start,
                endsAt: request.endsAt,
                status: request.mode === 'now' ? 'checked_out' : 'approved',
                purpose: request.purpose.trim(),
                notes: request.notes.trim(),
                returnNotes: '',
                borrower: user.name,
                checkedOutAt: request.mode === 'now' ? start : null,
                returnedAt: null,
            };
            data.reservations.push(reservation);
            if (reservation.checkedOutAt)
                data.movements.unshift({
                    id: nextId(data.movements),
                    keyId: request.keyId,
                    reservationId: reservation.id,
                    kind: 'withdrawal',
                    occurredAt: start,
                    responsible: user.name,
                });
            emit();
            return view();
        },
        async checkoutReservation(id, signal) {
            await delay(signal, options.latency ?? 120);
            availableToOperate();
            const reservation = data.reservations.find(
                (item) => item.id === id && item.status === 'approved',
            );
            if (!reservation)
                throw new Error('Este agendamento não está disponível.');
            if (
                reservation.operatorId !== actorId &&
                !can(actor().role, 'manageKeys')
            )
                throw new Error('Este agendamento pertence a outra pessoa.');
            const borrower = data.team.find(
                (member) => member.id === reservation.operatorId,
            );
            if (
                !borrower ||
                borrower.role === 'unauthorized' ||
                memberStatus(borrower, now()) !== 'active'
            )
                throw new Error(
                    'A pessoa deste agendamento está sem permissão de acesso.',
                );
            if (parseLocal(reservation.startsAt) > parseLocal(now()))
                throw new Error('Aguarde o horário de início do agendamento.');
            if (parseLocal(reservation.endsAt) <= parseLocal(now()))
                throw new Error('O período deste agendamento já terminou.');
            // The booked person's restrictions remain in force when an admin checks it out.
            const { start } = validatePeriod(
                {
                    keyId: reservation.keyId,
                    mode: 'now',
                    endsAt: reservation.endsAt,
                    purpose: reservation.purpose,
                    notes: reservation.notes,
                },
                id,
            );
            enforceRules(
                data.globalRules,
                start,
                reservation.endsAt,
                reservation.operatorId,
            );
            enforceRules(
                data.keys.find((key) => key.id === reservation.keyId)!.rules,
                start,
                reservation.endsAt,
                reservation.operatorId,
            );
            reservation.status = 'checked_out';
            reservation.checkedOutAt = start;
            data.movements.unshift({
                id: nextId(data.movements),
                keyId: reservation.keyId,
                reservationId: id,
                kind: 'withdrawal',
                occurredAt: start,
                responsible: reservation.borrower,
            });
            emit();
            return view();
        },
        async returnKey(request, signal) {
            await delay(signal, options.latency ?? 120);
            availableToOperate();
            const reservation = data.reservations.find(
                (item) =>
                    item.id === request.reservationId &&
                    item.status === 'checked_out',
            );
            if (!reservation)
                throw new Error('Esta chave não tem uma retirada em aberto.');
            const returnedAt = now();
            if (parseLocal(returnedAt) < parseLocal(reservation.checkedOutAt!))
                throw new Error(
                    'O horário atual não pode ser anterior à retirada.',
                );
            reservation.returnedAt = returnedAt;
            reservation.returnNotes = request.notes.trim();
            reservation.status = 'returned';
            data.movements.unshift({
                id: nextId(data.movements),
                keyId: reservation.keyId,
                reservationId: reservation.id,
                kind: 'return',
                occurredAt: returnedAt,
                responsible: actor().name,
            });
            emit();
            return view();
        },
        async registerMovement(keyId, kind, signal) {
            if (kind === 'withdrawal')
                return service.reserve(
                    {
                        keyId,
                        mode: 'now',
                        endsAt: addMinutes(now(), 60),
                        purpose: 'Atendimento',
                        notes: '',
                    },
                    signal,
                );
            const reservation = data.reservations.find(
                (item) => item.keyId === keyId && item.status === 'checked_out',
            );
            if (!data.keys.find((key) => key.id === keyId)?.active)
                throw new Error(
                    'Esta chave não está disponível para movimentação.',
                );
            return service.returnKey(
                { reservationId: reservation?.id ?? -1, notes: '' },
                signal,
            );
        },
        async cancelReservation(id) {
            await delay(undefined, options.latency ?? 120);
            availableToOperate();
            const reservation = data.reservations.find(
                (item) => item.id === id && item.status === 'approved',
            );
            if (!reservation)
                throw new Error('Somente agendamentos podem ser cancelados.');
            if (
                reservation.operatorId !== actorId &&
                !can(actor().role, 'manageKeys')
            )
                throw new Error(
                    'Você não pode cancelar o agendamento de outra pessoa.',
                );
            // Cancellation is staged too, preserving the booking until the undo deadline.
            const preview = structuredClone(data);
            preview.reservations.find((item) => item.id === id)!.status =
                'cancelled';
            schedulePending(
                { type: 'cancel-reservation', reservationId: id },
                preview,
                'Agendamento cancelado',
            );
            emit();
            return view();
        },
        async stageAdmin(action) {
            await delay(undefined, options.latency ?? 120);
            if (pending)
                throw new Error('Conclua ou desfaça a alteração pendente.');
            const preview = applyAdmin(data, action);
            const label =
                action.type === 'archive-key'
                    ? 'Chave arquivada'
                    : action.type === 'team-access'
                      ? 'Acesso da pessoa atualizado'
                      : action.type === 'set-key-block'
                        ? action.block
                            ? 'Chave bloqueada'
                            : 'Chave desbloqueada'
                        : action.type === 'global-rules'
                          ? 'Regras globais atualizadas'
                          : action.keyId
                            ? 'Chave atualizada'
                            : 'Chave criada';
            schedulePending(action, preview, label);
            emit();
            return view();
        },
        async undoPending(id) {
            if (
                !pending ||
                pending.id !== id ||
                clock().getTime() >= pending.deadline
            )
                throw new Error('O prazo para desfazer terminou.');
            clearTimeout(pending.timer);
            pending = null;
            emit('Alteração desfeita.');
            return view();
        },
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        dispose() {
            if (pending) clearTimeout(pending.timer);
            pending = null;
            listeners.clear();
        },
    };
    type InternalAction =
        | AdminAction
        | { type: 'cancel-reservation'; reservationId: number };
    function schedulePending(
        requestedAction: InternalAction,
        preview: DashboardSnapshot,
        label: string,
    ) {
        const action = structuredClone(requestedAction);
        const id = `change-${++sequence}`;
        const timer = setTimeout(() => {
            if (!pending || pending.id !== id) return;
            try {
                if (scenario === 'commit-error')
                    throw new Error(
                        'Não foi possível concluir. A alteração foi restaurada.',
                    );
                if (action.type === 'cancel-reservation') {
                    const reservation = data.reservations.find(
                        (item) =>
                            item.id === action.reservationId &&
                            item.status === 'approved',
                    );
                    if (!reservation)
                        throw new Error(
                            'O agendamento mudou. A alteração foi restaurada.',
                        );
                    reservation.status = 'cancelled';
                } else data = applyAdmin(data, action);
                pending = null;
                emit(`${label}.`);
            } catch (error) {
                pending = null;
                emit(
                    undefined,
                    error instanceof Error
                        ? error.message
                        : 'A alteração falhou e foi restaurada.',
                );
            }
        }, 5000);
        pending = {
            id,
            label,
            deadline: clock().getTime() + 5000,
            action: action as AdminAction,
            preview,
            timer,
        };
    }
    return service;
}
