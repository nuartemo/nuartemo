// DTOs from the existing PHP controllers; they are NOT DashboardSnapshot.
// Their controllers have no registered HTTP routes in this checkout.
export interface ObservedKey { id: number; name: string; description: string | null }
export type ObservedReservationStatus = 'pending' | 'approved' | 'rejected' | 'checked_out' | 'returned';
export interface ObservedReservation {
    id: number; key_id: number; user_id: number;
    starts_at: string; ends_at: string; status: ObservedReservationStatus;
    purpose: string; notes?: string | null;
    checked_out_at?: string | null; returned_at?: string | null;
}
function record(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function list(value: unknown): unknown[] {
    if (!record(value) || !Array.isArray(value.data)) throw new Error('Envelope institucional incompatível.');
    return value.data;
}
function positiveId(value: unknown): value is number { return Number.isInteger(value) && Number(value) > 0; }
export function readObservedKeys(value: unknown): ObservedKey[] {
    return list(value).map((item) => {
        if (!record(item) || !positiveId(item.id) || typeof item.name !== 'string' ||
            (item.description !== null && typeof item.description !== 'string'))
            throw new Error('Contrato de chave incompatível.');
        return { id: item.id, name: item.name, description: item.description };
    });
}
export function readObservedReservations(value: unknown): ObservedReservation[] {
    return list(value).map((item) => {
        if (!record(item) || !positiveId(item.id) || !positiveId(item.key_id) || !positiveId(item.user_id) ||
            typeof item.starts_at !== 'string' || typeof item.ends_at !== 'string' ||
            typeof item.purpose !== 'string' ||
            !['pending', 'approved', 'rejected', 'checked_out', 'returned'].includes(String(item.status)) ||
            ['notes', 'checked_out_at', 'returned_at'].some((field) =>
                item[field] !== undefined && item[field] !== null && typeof item[field] !== 'string'))
            throw new Error('Contrato de reserva incompatível.');
        return {
            id: item.id, key_id: item.key_id, user_id: item.user_id,
            starts_at: item.starts_at, ends_at: item.ends_at, purpose: item.purpose,
            status: item.status as ObservedReservationStatus,
            notes: item.notes as string | null | undefined,
            checked_out_at: item.checked_out_at as string | null | undefined,
            returned_at: item.returned_at as string | null | undefined,
        };
    });
}
