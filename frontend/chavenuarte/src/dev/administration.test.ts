import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDemoService } from './demo-service';
import { createDemoSnapshot } from './fixtures';
import { unrestrictedRules } from '../services/rules';
import { keyStatus } from '../services/selectors';
import type { AdminAction, KeyDraft, KeyService } from '../types/domain';
const services: KeyService[] = [];
function make(
    options: Parameters<typeof createDemoService>[1] = {},
    scenario: Parameters<typeof createDemoService>[0] = 'ready',
) {
    const service = createDemoService(scenario, { latency: 0, ...options });
    services.push(service);
    return service;
}
async function finish<T>(promise: Promise<T>) {
    await vi.advanceTimersByTimeAsync(0);
    return promise;
}
async function reject(promise: Promise<unknown>, message: string) {
    const assertion = expect(promise).rejects.toThrow(message);
    await vi.advanceTimersByTimeAsync(0);
    await assertion;
}
const draft = (): KeyDraft => ({
    code: 'CH-09',
    name: 'Chave nova',
    description: 'Acesso à sala',
    spaceId: null,
    rules: unrestrictedRules(),
    block: null,
});
const access = (
    userId: number,
    role: 'admin' | 'supervisor' | 'bolsista' | 'unauthorized',
    status: 'active' | 'suspended' | 'revoked' = 'active',
    suspendedUntil: string | null = null,
): AdminAction => ({
    type: 'team-access',
    userId,
    role,
    status,
    suspendedUntil,
});
beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-14T13:00:00Z'));
});
afterEach(() => {
    services.forEach((service) => service.dispose());
    services.length = 0;
    vi.useRealTimers();
});
describe('gestão administrativa e janela de desfazer', () => {
    it('mantém o arquivamento pendente por 5 segundos e desfaz de verdade antes do prazo', async () => {
        const service = make();
        const staged = await finish(
            service.stageAdmin({ type: 'archive-key', keyId: 5 }),
        );
        expect(staged.keys[4].active).toBe(false);
        expect(staged.pendingChange?.deadline).toBe(Date.now() + 5000);
        await vi.advanceTimersByTimeAsync(4999);
        expect((await finish(service.load())).pendingChange).not.toBeNull();
        const restored = await service.undoPending(staged.pendingChange!.id);
        expect(restored.keys[4].active).toBe(true);
        await vi.advanceTimersByTimeAsync(1);
        expect((await finish(service.load())).keys[4].active).toBe(true);
    });
    it('finaliza somente após o prazo e não permite desfazer uma operação já finalizada', async () => {
        const service = make();
        const staged = await finish(
            service.stageAdmin({ type: 'archive-key', keyId: 5 }),
        );
        await vi.advanceTimersByTimeAsync(5000);
        const final = await finish(service.load());
        expect(final.pendingChange).toBeNull();
        expect(final.keys[4].active).toBe(false);
        expect(final.reservations.some((item) => item.keyId === 5)).toBe(true);
        expect(final.movements.some((item) => item.keyId === 5)).toBe(true);
        await expect(
            service.undoPending(staged.pendingChange!.id),
        ).rejects.toThrow('prazo');
    });
    it('restaura a visualização e publica erro se a confirmação tardia falhar', async () => {
        const service = make({}, 'commit-error');
        const listener = vi.fn();
        service.subscribe(listener);
        await finish(service.stageAdmin({ type: 'archive-key', keyId: 5 }));
        await vi.advanceTimersByTimeAsync(5000);
        const snapshot = await finish(service.load());
        expect(snapshot.keys[4].active).toBe(true);
        expect(snapshot.pendingChange).toBeNull();
        expect(listener.mock.lastCall?.[0].error).toMatch(/restaurada/);
    });
    it('cria chave sem restrições especiais e mantém espaço separado da chave física', async () => {
        const service = make();
        const value = {
            ...draft(),
            newSpace: {
                name: 'Sala de leitura',
                block: 'Bloco B',
                room: '102',
            },
        };
        let snapshot = await finish(
            service.stageAdmin({ type: 'save-key', value }),
        );
        expect(snapshot.keys.at(-1)?.rules).toEqual(unrestrictedRules());
        expect(snapshot.keys.at(-1)?.spaceId).toBe(snapshot.spaces.at(-1)?.id);
        expect(snapshot.spaces.at(-1)?.name).toBe('Sala de leitura');
        await vi.advanceTimersByTimeAsync(5000);
        snapshot = await finish(service.load());
        expect(snapshot.keys.at(-1)?.name).toBe('Chave nova');
        expect(snapshot.pendingChange).toBeNull();
    });
    it('edita localização, descrição e restrições e permite remover regras existentes', async () => {
        const service = make();
        const initial = await finish(service.load());
        const key = initial.keys[3];
        const value = {
            ...draft(),
            code: key.code,
            name: key.name,
            description: 'Descrição alterada',
            spaceId: 1,
            rules: {
                ...unrestrictedRules(),
                windows: [{ start: '08:00', end: '16:00' }],
                maxDurationMinutes: 60,
                allowedMemberIds: [3],
            },
        };
        await finish(service.stageAdmin({ type: 'save-key', keyId: 4, value }));
        await vi.advanceTimersByTimeAsync(5000);
        let snapshot = await finish(service.load());
        expect(snapshot.keys[3]).toMatchObject({
            description: 'Descrição alterada',
            spaceId: 1,
        });
        expect(snapshot.keys[3].rules.allowedMemberIds).toEqual([3]);
        await finish(
            service.stageAdmin({
                type: 'save-key',
                keyId: 4,
                value: { ...value, rules: unrestrictedRules() },
            }),
        );
        await vi.advanceTimersByTimeAsync(5000);
        snapshot = await finish(service.load());
        expect(snapshot.keys[3].rules).toEqual(unrestrictedRules());
    });
    it('bloqueia e desbloqueia chave preservando os registros', async () => {
        const service = make();
        await finish(
            service.stageAdmin({
                type: 'set-key-block',
                keyId: 4,
                block: {
                    kind: 'permanent',
                    reason: 'Manutenção',
                    startsAt: null,
                    endsAt: null,
                },
            }),
        );
        await vi.advanceTimersByTimeAsync(5000);
        let snapshot = await finish(service.load());
        expect(keyStatus(snapshot.keys[3], snapshot)).toBe('blocked');
        await finish(
            service.stageAdmin({
                type: 'set-key-block',
                keyId: 4,
                block: null,
            }),
        );
        await vi.advanceTimersByTimeAsync(5000);
        snapshot = await finish(service.load());
        expect(keyStatus(snapshot.keys[3], snapshot)).toBe('available');
    });
    it('recusa código duplicado, horário inválido e bloqueio sem motivo', async () => {
        const service = make();
        await reject(
            service.stageAdmin({
                type: 'save-key',
                value: { ...draft(), code: 'CH-01' },
            }),
            'código',
        );
        await reject(
            service.stageAdmin({
                type: 'save-key',
                value: {
                    ...draft(),
                    rules: {
                        ...unrestrictedRules(),
                        windows: [{ start: '15:99', end: '16:00' }],
                    },
                },
            }),
            'faixas horárias',
        );
        await reject(
            service.stageAdmin({
                type: 'set-key-block',
                keyId: 4,
                block: {
                    kind: 'permanent',
                    reason: '',
                    startsAt: null,
                    endsAt: null,
                },
            }),
            'motivo',
        );
    });
    it('não arquiva uma chave com retirada aberta ou agendamento futuro', async () => {
        const service = make();
        await reject(
            service.stageAdmin({ type: 'archive-key', keyId: 1 }),
            'Devolva',
        );
        await reject(
            service.stageAdmin({ type: 'archive-key', keyId: 2 }),
            'Cancele',
        );
    });
    it('supervisor promove e rebaixa usuários, incluindo administradores', async () => {
        const service = make();
        await finish(service.stageAdmin(access(3, 'admin')));
        await vi.advanceTimersByTimeAsync(5000);
        expect((await finish(service.load())).team[2].role).toBe('admin');
        await finish(service.stageAdmin(access(3, 'bolsista')));
        await vi.advanceTimersByTimeAsync(5000);
        expect((await finish(service.load())).team[2].role).toBe('bolsista');
        await finish(service.stageAdmin(access(2, 'supervisor')));
        await vi.advanceTimersByTimeAsync(5000);
        expect((await finish(service.load())).team[1].role).toBe('supervisor');
    });
    it('administrador só gerencia bolsistas e perfis sem acesso', async () => {
        const service = make({ role: 'admin' });
        await reject(service.stageAdmin(access(3, 'admin')), 'só podem');
        await reject(
            service.stageAdmin(access(1, 'unauthorized', 'revoked')),
            'nível superior',
        );
        await reject(
            service.stageAdmin(access(2, 'supervisor')),
            'nível superior',
        );
        const staged = await finish(
            service.stageAdmin(access(3, 'unauthorized', 'revoked')),
        );
        expect(staged.team[2].role).toBe('unauthorized');
    });
    it.each<AdminAction>([
        access(1, 'admin'),
        access(1, 'unauthorized', 'revoked'),
        access(1, 'supervisor', 'suspended'),
        access(1, 'supervisor', 'suspended', '2026-11-15T10:00'),
    ])('protege o último supervisor ativo: %j', async (action) => {
        await reject(make().stageAdmin(action), 'supervisor ativo');
    });
    it('permite rebaixamento próprio com outro supervisor, mas impede autopromoção posterior', async () => {
        const initial = createDemoSnapshot(new Date());
        initial.team[1].role = 'supervisor';
        const service = make({ initial });
        await finish(service.stageAdmin(access(1, 'admin')));
        await vi.advanceTimersByTimeAsync(5000);
        expect((await finish(service.load())).currentUser.role).toBe('admin');
        await reject(
            service.stageAdmin(access(1, 'supervisor')),
            'nível superior',
        );
    });
    it('revoga permissão preservando identidade e histórico; permite reativação autorizada', async () => {
        const service = make();
        const before = await finish(service.load());
        await finish(service.stageAdmin(access(3, 'unauthorized', 'revoked')));
        await vi.advanceTimersByTimeAsync(5000);
        let snapshot = await finish(service.load());
        expect(snapshot.team[2]).toMatchObject({
            id: 3,
            registration: 'DEMO-003',
            status: 'revoked',
        });
        expect(snapshot.reservations).toEqual(before.reservations);
        expect(snapshot.movements).toEqual(before.movements);
        await finish(service.stageAdmin(access(3, 'bolsista')));
        await vi.advanceTimersByTimeAsync(5000);
        snapshot = await finish(service.load());
        expect(snapshot.team[2]).toMatchObject({
            role: 'bolsista',
            status: 'active',
        });
    });
    it('suspende temporariamente, expira no horário previsto e permite suspensão permanente e reativação', async () => {
        const service = make();
        await finish(
            service.stageAdmin(
                access(3, 'bolsista', 'suspended', '2026-11-14T10:01'),
            ),
        );
        await vi.advanceTimersByTimeAsync(5000);
        expect((await finish(service.load())).team[2].status).toBe('suspended');
        await vi.advanceTimersByTimeAsync(55_000);
        expect((await finish(service.load())).team[2].status).toBe('active');
        await finish(service.stageAdmin(access(3, 'bolsista', 'suspended')));
        await vi.advanceTimersByTimeAsync(5000);
        expect((await finish(service.load())).team[2].status).toBe('suspended');
        await finish(service.stageAdmin(access(3, 'bolsista')));
        await vi.advanceTimersByTimeAsync(5000);
        expect((await finish(service.load())).team[2].status).toBe('active');
    });
    it('recusa suspensão temporária no passado', async () => {
        await reject(
            make().stageAdmin(
                access(3, 'bolsista', 'suspended', '2026-11-14T09:00'),
            ),
            'futuro',
        );
    });
    it('bolsista não altera equipe, chaves ou configurações', async () => {
        const service = make({ role: 'bolsista' });
        await reject(
            service.stageAdmin(access(4, 'admin')),
            'gerenciar a equipe',
        );
        await reject(
            service.stageAdmin({ type: 'save-key', value: draft() }),
            'gerenciar chaves',
        );
        await reject(
            service.stageAdmin({
                type: 'global-rules',
                rules: unrestrictedRules(),
            }),
            'gerenciar chaves',
        );
    });
    it('cancela agendamento com desfazer funcional, sem criar evento de retirada', async () => {
        const service = make({ role: 'bolsista' });
        const staged = await finish(service.cancelReservation(5));
        expect(staged.reservations[4].status).toBe('cancelled');
        await service.undoPending(staged.pendingChange!.id);
        expect((await finish(service.load())).reservations[4].status).toBe(
            'approved',
        );
        await finish(service.cancelReservation(5));
        await vi.advanceTimersByTimeAsync(5000);
        const result = await finish(service.load());
        expect(result.reservations[4].status).toBe('cancelled');
        expect(result.movements).toHaveLength(6);
    });
    it('evita operações concorrentes durante uma alteração administrativa pendente', async () => {
        const service = make();
        await finish(service.stageAdmin({ type: 'archive-key', keyId: 5 }));
        await reject(
            service.stageAdmin({ type: 'save-key', value: draft() }),
            'pendente',
        );
        await reject(service.registerMovement(4, 'withdrawal'), 'Desfazer');
    });
});
