export class InstitutionalHttpError extends Error {
    constructor(public readonly status: number, message: string) { super(message); }
}
const messages: Record<number, string> = {
    401: 'Sua sessão expirou. Acesse novamente pela entrada institucional.',
    403: 'Seu perfil não tem permissão para esta operação.',
    419: 'Sua sessão expirou. Recarregue a página antes de tentar novamente.',
    422: 'Os dados enviados não foram aceitos. Revise os campos.',
};

// Transport only: no route is assumed or enabled here. Pass an observed URL
// relative to the application's root only after its backend contract exists.
export function createInstitutionalHttp(base: URL, fetcher: typeof fetch = fetch) {
    const applicationRoot = new URL(base);
    if (applicationRoot.origin !== window.location.origin || !applicationRoot.pathname.endsWith('/'))
        throw new Error('A base institucional deve pertencer à aplicação atual.');
    return async function requestJson(path: string, options: {
        method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
        body?: unknown;
        signal?: AbortSignal;
    } = {}): Promise<unknown> {
        const url = new URL(path, applicationRoot);
        if (!path || /^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith('/') || url.origin !== applicationRoot.origin ||
            !url.pathname.startsWith(applicationRoot.pathname) || /[\\%]/.test(path))
            throw new Error('Destino institucional inválido.');
        const method = options.method ?? 'GET';
        const headers = new Headers({ Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' });
        if (method !== 'GET') {
            const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
            if (!token) throw new InstitutionalHttpError(419, messages[419]);
            headers.set('X-CSRF-TOKEN', token);
            headers.set('Content-Type', 'application/json');
        }
        const response = await fetcher(url.href, {
            method, headers, credentials: 'same-origin', redirect: 'error',
            signal: options.signal,
            ...(method !== 'GET' && options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
        });
        if (!response.ok) throw new InstitutionalHttpError(response.status,
            messages[response.status] ?? 'Não foi possível concluir a operação institucional.');
        if (response.redirected || !response.headers.get('content-type')?.includes('application/json'))
            throw new InstitutionalHttpError(0, 'O servidor não retornou o contrato JSON esperado.');
        return response.json();
    };
}
