import type {
    DashboardSnapshot,
    Key,
    KeyBlock,
    KeyStatus,
    Reservation,
    ReservationState,
    TeamMember,
} from '../types/domain';
import { localNow, parseLocal } from './date-time';
export { formatTime, formatDate, formatDateTime } from './date-time';
export function blockApplies(
    block: KeyBlock | null,
    start: string,
    end = start,
): boolean {
    if (!block) return false;
    if (block.kind === 'permanent') return true;
    const a = parseLocal(start),
        b = parseLocal(end),
        from = parseLocal(block.startsAt ?? ''),
        to = parseLocal(block.endsAt ?? '');
    return a === b ? from <= a && a < to : a < to && b > from;
}
export function keyStatus(
    key: Key,
    snapshot: DashboardSnapshot,
    now = localNow(),
): KeyStatus {
    if (
        snapshot.reservations.some(
            (reservation) =>
                reservation.keyId === key.id &&
                reservation.status === 'checked_out',
        )
    )
        return 'in_use';
    if (!key.active) return 'inactive';
    return blockApplies(key.block, now) ? 'blocked' : 'available';
}
export const statusLabels: Record<KeyStatus, string> = {
    available: 'Disponível',
    in_use: 'Em uso',
    inactive: 'Arquivada',
    blocked: 'Bloqueada',
};
export const reservationLabels: Record<ReservationState, string> = {
    scheduled: 'Agendada',
    in_use: 'Em uso',
    returned: 'Devolvida',
    overdue: 'Atrasada',
    cancelled: 'Cancelada',
};
export function reservationState(
    item: Reservation,
    now = localNow(),
): ReservationState {
    if (item.status === 'returned') return 'returned';
    if (item.status === 'cancelled') return 'cancelled';
    if (item.status === 'checked_out')
        return parseLocal(item.endsAt) < parseLocal(now) ? 'overdue' : 'in_use';
    return 'scheduled';
}
export function memberStatus(
    member: TeamMember,
    now = localNow(),
): TeamMember['status'] {
    return member.status === 'suspended' &&
        member.suspendedUntil &&
        parseLocal(member.suspendedUntil) <= parseLocal(now)
        ? 'active'
        : member.status;
}
export function locationLabel(key: Key, snapshot: DashboardSnapshot): string {
    const space = snapshot.spaces.find((item) => item.id === key.spaceId);
    return space
        ? [space.name, space.block, space.room].filter(Boolean).join(' · ')
        : 'Sem sala associada';
}
export function futureBookings(
    keyId: number,
    snapshot: DashboardSnapshot,
    now = localNow(),
): Reservation[] {
    return snapshot.reservations
        .filter(
            (item) =>
                item.keyId === keyId &&
                item.status === 'approved' &&
                parseLocal(item.endsAt) > parseLocal(now),
        )
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}
