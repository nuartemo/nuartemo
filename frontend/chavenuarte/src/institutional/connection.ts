import type { KeyService, Role } from '../types/domain';

export type InstitutionalConnection =
    | { status: 'pending'; suapIdentifier: string | null }
    | { status: 'ready'; service: KeyService; role: Role };

// Integration seam for the backend team. There are NO reachable key/reservation
// routes in the inspected application. Do not fabricate URLs or a snapshot.
// A future implementation must obtain identity, role and data from the server.
export async function connectInstitutionalPanel(signal: AbortSignal): Promise<InstitutionalConnection> {
    signal.throwIfAborted();
    // Display only the identifier escaped into the view from the existing SUAP
    // session. It is not a local user ID, name, role or authority for operations.
    const identifier = document.getElementById('chavenuarte-v2-root')?.dataset.suapIdentifier?.trim();
    return { status: 'pending', suapIdentifier: identifier || null };
}
