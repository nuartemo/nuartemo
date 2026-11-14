import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDemoService } from './demo-service';
import { keyStatus } from '../services/selectors';

afterEach(() => vi.useRealTimers());

async function complete<T>(operation: Promise<T>) {
    await vi.runAllTimersAsync();
    return operation;
}

describe('serviço demonstrativo em memória', () => {
    it('retira e devolve uma chave, mantendo reserva, disponibilidade e histórico consistentes', async () => {
        vi.useFakeTimers();
        const service = createDemoService();
        const initial = await complete(service.load());
        const key = initial.keys.find(
            (item) => keyStatus(item, initial) === 'available',
        )!;
        const withdrawn = await complete(
            service.registerMovement(key.id, 'withdrawal'),
        );
        expect(keyStatus(key, withdrawn)).toBe('in_use');
        expect(withdrawn.movements).toHaveLength(initial.movements.length + 1);
        const returned = await complete(
            service.registerMovement(key.id, 'return'),
        );
        expect(keyStatus(key, returned)).toBe('available');
        expect(returned.movements[0]).toMatchObject({
            keyId: key.id,
            kind: 'return',
        });
        expect(initial.movements).toHaveLength(6);
    });

    it('recusa retirada duplicada, devolução sem retirada e chave inativa', async () => {
        vi.useFakeTimers();
        const service = createDemoService();
        const duplicate = expect(
            service.registerMovement(1, 'withdrawal'),
        ).rejects.toThrow('já está em uso');
        await vi.runAllTimersAsync();
        await duplicate;
        const noWithdrawal = expect(
            service.registerMovement(2, 'return'),
        ).rejects.toThrow('não tem uma retirada');
        await vi.runAllTimersAsync();
        await noWithdrawal;
        const inactive = expect(
            service.registerMovement(8, 'withdrawal'),
        ).rejects.toThrow('não está disponível');
        await vi.runAllTimersAsync();
        await inactive;
    });

    it('não altera dados se uma operação for cancelada', async () => {
        vi.useFakeTimers();
        const service = createDemoService();
        const controller = new AbortController();
        const aborted = expect(
            service.registerMovement(2, 'withdrawal', controller.signal),
        ).rejects.toMatchObject({ name: 'AbortError' });
        controller.abort();
        await aborted;
        const snapshot = await complete(service.load());
        expect(keyStatus(snapshot.keys[1], snapshot)).toBe('available');
    });

    it('isola os cenários e protege o estado interno de mutações externas', async () => {
        vi.useFakeTimers();
        const empty = await complete(createDemoService('empty').load());
        expect(empty.keys).toEqual([]);
        const service = createDemoService();
        const first = await complete(service.load());
        first.keys.length = 0;
        expect((await complete(service.load())).keys).toHaveLength(8);
        const error = expect(createDemoService('error').load()).rejects.toThrow(
            'cenário demonstrativo',
        );
        await vi.runAllTimersAsync();
        await error;
    });
});
