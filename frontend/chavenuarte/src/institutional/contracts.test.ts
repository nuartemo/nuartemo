import { afterEach, describe, expect, it, vi } from 'vitest';
import { createInstitutionalHttp, InstitutionalHttpError } from './http';
import { readObservedKeys, readObservedReservations } from './observed-contracts';
import { connectInstitutionalPanel } from './connection';

const base = new URL('/nuarte/', window.location.origin);
const reservation = { id: 1, key_id: 4, user_id: 7, starts_at: '2026-11-15T13:00:00.000000Z',
    ends_at: '2026-11-15T15:00:00.000000Z', purpose: 'Ensaio', status: 'pending' };
afterEach(() => { document.querySelector('meta[name="csrf-token"]')?.remove(); localStorage.clear(); });
describe('simulações dos contratos observados (controllers sem rotas HTTP)', () => {
    it('preserva o contrato parcial de chaves sem inventar código, espaço ou regras', async () => {
        const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ data: [{ id: 4, name: 'Sala', description: null }] }));
        const response = await createInstitutionalHttp(base, fetcher)('contract-fixtures/keys');
        expect(readObservedKeys(response)).toEqual([{ id: 4, name: 'Sala', description: null }]);
        const [url, init] = fetcher.mock.calls[0];
        expect(url).toBe(`${base}contract-fixtures/keys`);
        expect(init?.credentials).toBe('same-origin');
        expect(new Headers(init?.headers).get('Accept')).toBe('application/json');
        expect(new Headers(init?.headers).has('X-CSRF-TOKEN')).toBe(false);
    });
    it.each(['pending', 'approved', 'rejected', 'checked_out', 'returned'])('preserva status %s e datas sem fingir compatibilidade V2', (status) => {
        expect(readObservedReservations({ data: [{ ...reservation, status }] })[0]).toMatchObject({ status, starts_at: reservation.starts_at });
    });
    it.each([{}, { data: {} }, { data: [{ id: '4', name: 'Sala' }] }])('rejeita resposta de chaves incompatível', (response) => {
        expect(() => readObservedKeys(response)).toThrow();
    });
    it('rejeita enumeração e identidade inválidas', () => {
        expect(() => readObservedReservations({ data: [{ ...reservation, status: 'scheduled' }] })).toThrow();
        expect(() => readObservedReservations({ data: [{ ...reservation, user_id: null }] })).toThrow();
    });
    it('envia cookie e CSRF do Blade somente para a aplicação atual', async () => {
        const meta = document.createElement('meta'); meta.name = 'csrf-token'; meta.content = 'test-csrf'; document.head.append(meta);
        const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ data: reservation }, { status: 201 }));
        const body = { key_id: 4, starts_at: reservation.starts_at, ends_at: reservation.ends_at, purpose: 'Ensaio' };
        const signal = new AbortController().signal;
        await createInstitutionalHttp(base, fetcher)('contract-fixtures/reservations', { method: 'POST', body, signal });
        expect(fetcher.mock.calls[0][1]).toMatchObject({ method: 'POST', credentials: 'same-origin', redirect: 'error', body: JSON.stringify(body), signal });
        expect(new Headers(fetcher.mock.calls[0][1]?.headers).get('X-CSRF-TOKEN')).toBe('test-csrf');
    });
    it('interrompe mutações sem CSRF antes de enviar', async () => {
        const fetcher = vi.fn<typeof fetch>();
        await expect(createInstitutionalHttp(base, fetcher)('contract-fixtures/reservations', { method: 'POST' })).rejects.toMatchObject({ status: 419 });
        expect(fetcher).not.toHaveBeenCalled();
    });
    it.each([401, 403, 419, 422, 500])('não substitui HTTP %s por dados demo', async (status) => {
        const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ message: 'private server details' }, { status }));
        await expect(createInstitutionalHttp(base, fetcher)('contract-fixtures/keys')).rejects.toBeInstanceOf(InstitutionalHttpError);
    });
    it('rejeita HTML de login e preserva cancelamento/falha de rede', async () => {
        const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response('<html>login</html>', { headers: { 'Content-Type': 'text/html' } }));
        await expect(createInstitutionalHttp(base, fetcher)('contract-fixtures/keys')).rejects.toMatchObject({ status: 0 });
        const abort = new DOMException('Aborted', 'AbortError'); fetcher.mockRejectedValue(abort);
        await expect(createInstitutionalHttp(base, fetcher)('contract-fixtures/keys')).rejects.toBe(abort);
    });
    it.each(['https://other.example/keys', '//other.example/keys', '../keys', '/keys', 'keys%2fescape', 'https://localhost/nuarte/keys'])('bloqueia destino fora da base: %s', async (path) => {
        const fetcher = vi.fn<typeof fetch>();
        await expect(createInstitutionalHttp(base, fetcher)(path)).rejects.toThrow();
        expect(fetcher).not.toHaveBeenCalled();
    });
    it('identificadores e cargos manipulados no navegador não liberam integração', async () => {
        localStorage.setItem('role', 'supervisor');
        localStorage.setItem('suap.key_panel_identifier', '123');
        expect(await connectInstitutionalPanel(new AbortController().signal)).toEqual({ status: 'pending', suapIdentifier: null });
    });
});
