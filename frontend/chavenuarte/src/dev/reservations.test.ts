import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDemoService } from './demo-service';
import { createDemoSnapshot } from './fixtures';
import { keyStatus, reservationState } from '../services/selectors';
import { unrestrictedRules } from '../services/rules';
import type { KeyService, ReservationRequest } from '../types/domain';
const services: KeyService[] = [];
const make = (options: Parameters<typeof createDemoService>[1] = {}) => {
    const service = createDemoService('ready', { latency: 0, ...options });
    services.push(service);
    return service;
};
async function finish<T>(promise: Promise<T>) {
    await vi.advanceTimersByTimeAsync(0);
    return promise;
}
async function reject(promise: Promise<unknown>, message: string) {
    const assertion = expect(promise).rejects.toThrow(message);
    await vi.advanceTimersByTimeAsync(0);
    await assertion;
}
const request = (
    override: Partial<ReservationRequest> = {},
): ReservationRequest => ({
    keyId: 4,
    mode: 'schedule',
    startsAt: '2026-11-15T16:00',
    endsAt: '2026-11-15T17:00',
    purpose: 'Ensaio',
    notes: '',
    ...override,
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
describe('retiradas, agendamentos e devoluções', () => {
    it('gera retirada real e identidade pelo serviço, sem confiar em horário de início digitado', async () => {
        const service = make({ role: 'bolsista' });
        const snapshot = await finish(
            service.reserve(
                request({
                    mode: 'now',
                    startsAt: '2099-01-01T00:00',
                    endsAt: '2026-11-14T11:00',
                }),
            ),
        );
        const reservation = snapshot.reservations.at(-1)!;
        expect(reservation).toMatchObject({
            operatorId: 3,
            registration: 'DEMO-003',
            borrower: 'Joana Lima',
            status: 'checked_out',
            checkedOutAt: '2026-11-14T10:00:00',
        });
        expect(keyStatus(snapshot.keys[3], snapshot)).toBe('in_use');
    });
    it('agenda às 16:00 sem registrar retirada física nem retirar disponibilidade atual', async () => {
        const service = make();
        const before = await finish(service.load());
        const snapshot = await finish(service.reserve(request()));
        const reservation = snapshot.reservations.at(-1)!;
        expect(reservation.status).toBe('approved');
        expect(reservation.checkedOutAt).toBeNull();
        expect(snapshot.movements).toHaveLength(before.movements.length);
        expect(keyStatus(snapshot.keys[3], snapshot)).toBe('available');
        expect(reservationState(reservation)).toBe('scheduled');
    });
    it('bloqueia conflitos, mas aceita períodos adjacentes', async () => {
        const service = make();
        await finish(service.reserve(request()));
        await reject(
            service.reserve(
                request({
                    startsAt: '2026-11-15T16:30',
                    endsAt: '2026-11-15T17:30',
                }),
            ),
            'Já existe',
        );
        const snapshot = await finish(
            service.reserve(
                request({
                    startsAt: '2026-11-15T17:00',
                    endsAt: '2026-11-15T18:00',
                }),
            ),
        );
        expect(
            snapshot.reservations.filter((item) => item.keyId === 4),
        ).toHaveLength(2);
    });
    it.each<Partial<ReservationRequest>>([
        { startsAt: '2026-11-15T15:99' },
        { startsAt: '2026-02-30T16:00' },
        { endsAt: '2026-11-15T15:00' },
        { startsAt: '2026-11-13T16:00', endsAt: '2026-11-13T17:00' },
        { purpose: '   ' },
    ])('recusa períodos ou finalidades inválidos: %j', async (override) => {
        const service = make();
        const assertion = expect(
            service.reserve(request(override)),
        ).rejects.toThrow();
        await vi.advanceTimersByTimeAsync(0);
        await assertion;
        expect((await finish(service.load())).reservations).toHaveLength(5);
    });
    it('aceita datas completas ao cruzar meia-noite', async () => {
        const service = make();
        const result = await finish(
            service.reserve(
                request({
                    startsAt: '2026-11-15T23:00',
                    endsAt: '2026-11-16T01:00',
                }),
            ),
        );
        expect(result.reservations.at(-1)?.endsAt).toBe('2026-11-16T01:00');
    });
    it('registra a devolução com horário real e observação, preservando a retirada', async () => {
        const service = make();
        const first = await finish(
            service.reserve(
                request({ mode: 'now', endsAt: '2026-11-14T12:00' }),
            ),
        );
        const reservation = first.reservations.at(-1)!;
        await vi.advanceTimersByTimeAsync(45_000);
        const snapshot = await finish(
            service.returnKey({
                reservationId: reservation.id,
                notes: 'Chave conferida',
            }),
        );
        const returned = snapshot.reservations.at(-1)!;
        expect(returned).toMatchObject({
            status: 'returned',
            checkedOutAt: '2026-11-14T10:00:00',
            returnedAt: '2026-11-14T10:00:45',
            returnNotes: 'Chave conferida',
        });
        expect(reservationState(returned)).toBe('returned');
        expect(keyStatus(snapshot.keys[3], snapshot)).toBe('available');
        await reject(
            service.returnKey({ reservationId: reservation.id, notes: '' }),
            'não tem uma retirada',
        );
    });
    it('diferencia atraso de reserva futura e de uma retirada aberta', async () => {
        const snapshot = await finish(make().load());
        expect(reservationState(snapshot.reservations[1])).toBe('overdue');
        expect(reservationState(snapshot.reservations[0])).toBe('in_use');
        expect(reservationState(snapshot.reservations[4])).toBe('scheduled');
    });
    it('só ativa um agendamento dentro do período e não cria duas retiradas', async () => {
        const service = make();
        const snapshot = await finish(service.reserve(request()));
        const id = snapshot.reservations.at(-1)!.id;
        await reject(service.checkoutReservation(id), 'Aguarde');
        vi.setSystemTime(new Date('2026-11-15T19:05:00Z'));
        const result = await finish(service.checkoutReservation(id));
        expect(result.reservations.at(-1)).toMatchObject({
            status: 'checked_out',
            checkedOutAt: '2026-11-15T16:05:00',
        });
        await reject(service.checkoutReservation(id), 'não está disponível');
    });
    it('não permite retirar agendamento de pessoa sem acesso', async () => {
        const initial = createDemoSnapshot(new Date());
        initial.team[2].status = 'revoked';
        initial.team[2].role = 'unauthorized';
        const service = make({ initial });
        vi.setSystemTime(new Date('2026-11-15T19:05:00Z'));
        await reject(service.checkoutReservation(5), 'sem permissão');
    });
    it('aplica regras globais e específicas de dias, horários, duração e pessoa', async () => {
        const initial = createDemoSnapshot(new Date());
        initial.globalRules = {
            ...unrestrictedRules(),
            maxDurationMinutes: 30,
        };
        let service = make({ initial });
        await reject(service.reserve(request()), 'duração máxima');
        initial.globalRules = unrestrictedRules();
        initial.keys[3].rules = {
            ...unrestrictedRules(),
            allowedMemberIds: [4],
        };
        service = make({ initial, role: 'supervisor' });
        await reject(service.reserve(request()), 'matrícula');
        initial.keys[3].rules = {
            ...unrestrictedRules(),
            weekdays: [1, 2, 3, 4, 5],
        };
        service = make({ initial });
        await reject(service.reserve(request()), 'dia não autorizado');
        initial.keys[3].rules = {
            ...unrestrictedRules(),
            windows: [{ start: '08:00', end: '12:00' }],
        };
        service = make({ initial });
        await reject(service.reserve(request()), 'fora dos horários');
    });
    it('restringe também o dia seguinte de um período que atravessa meia-noite', async () => {
        const initial = createDemoSnapshot(new Date());
        initial.keys[3].rules = { ...unrestrictedRules(), weekdays: [0] };
        await reject(
            make({ initial }).reserve(
                request({
                    startsAt: '2026-11-15T23:00',
                    endsAt: '2026-11-16T01:00',
                }),
            ),
            'dia não autorizado',
        );
    });
    it('distingue bloqueio temporário de disponibilidade futura', async () => {
        const initial = createDemoSnapshot(new Date());
        initial.keys[3].block = {
            kind: 'temporary',
            startsAt: '2026-11-14T09:00',
            endsAt: '2026-11-14T11:00',
            reason: 'Manutenção',
        };
        const service = make({ initial });
        const before = await finish(service.load());
        expect(keyStatus(before.keys[3], before)).toBe('blocked');
        await reject(
            service.reserve(
                request({ mode: 'now', endsAt: '2026-11-14T10:30' }),
            ),
            'bloqueada',
        );
        expect(
            (await finish(service.reserve(request()))).reservations.at(-1)
                ?.status,
        ).toBe('approved');
    });
    it('nega operações de um perfil sem permissão e conserva os registros', async () => {
        const service = make({ role: 'unauthorized' });
        await reject(service.reserve(request()), 'sem permissão');
        expect((await finish(service.load())).reservations).toHaveLength(5);
    });
});
