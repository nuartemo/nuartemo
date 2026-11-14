import { statusLabels, reservationLabels } from '../services/selectors';
import type { KeyStatus, ReservationState } from '../types/domain';
export function StatusBadge({
    status,
}: {
    status: KeyStatus | ReservationState;
}) {
    const label =
        status in statusLabels
            ? statusLabels[status as KeyStatus]
            : reservationLabels[status as ReservationState];
    return (
        <span className={`status-badge status-${status}`}>
            <span aria-hidden="true" />
            {label}
        </span>
    );
}
