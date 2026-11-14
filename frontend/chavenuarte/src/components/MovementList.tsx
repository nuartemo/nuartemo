import type { DashboardSnapshot, Reservation } from '../types/domain';
import {
    formatDate,
    formatDateTime,
    formatTime,
    reservationState,
} from '../services/selectors';
import { EmptyState } from './States';
import { Icon } from './Icon';
import { StatusBadge } from './StatusBadge';
export function MovementList({
    snapshot,
    limit,
    reservations,
    onOpen,
}: {
    snapshot: DashboardSnapshot;
    limit?: number;
    reservations?: Reservation[];
    onOpen?: (reservation: Reservation) => void;
}) {
    const items = [...(reservations ?? snapshot.reservations)]
        .sort((a, b) =>
            (b.returnedAt ?? b.checkedOutAt ?? b.startsAt).localeCompare(
                a.returnedAt ?? a.checkedOutAt ?? a.startsAt,
            ),
        )
        .slice(0, limit);
    if (!items.length)
        return (
            <EmptyState
                title="Nenhuma movimentação"
                description="Retiradas e agendamentos aparecerão aqui."
            />
        );
    return (
        <ol className="movement-list">
            {items.map((item) => {
                const state = reservationState(item);
                const key = snapshot.keys.find((key) => key.id === item.keyId);
                const start = item.checkedOutAt ?? item.startsAt;
                const content = (
                    <>
                        <span className={`movement-icon movement-${state}`}>
                            <Icon
                                name={
                                    state === 'scheduled'
                                        ? 'calendar'
                                        : state === 'returned'
                                          ? 'arrowDown'
                                          : 'arrowUp'
                                }
                            />
                        </span>
                        <span className="movement-description">
                            <strong>
                                {key?.name ?? `Chave ${item.keyId}`}
                                <span className="history-code">
                                    {key?.code}
                                </span>
                            </strong>
                            <span>{item.borrower}</span>
                            <span className="movement-period">
                                <time dateTime={start}>
                                    {formatDate(start)} · {formatTime(start)}
                                </time>
                                <span>—</span>
                                {item.returnedAt ? (
                                    <time dateTime={item.returnedAt}>
                                        {start.slice(0, 10) !==
                                        item.returnedAt.slice(0, 10)
                                            ? formatDateTime(item.returnedAt)
                                            : formatTime(item.returnedAt)}
                                    </time>
                                ) : item.status === 'approved' ||
                                  item.status === 'cancelled' ? (
                                    <span>
                                        Até{' '}
                                        {start.slice(0, 10) !==
                                        item.endsAt.slice(0, 10)
                                            ? formatDateTime(item.endsAt)
                                            : formatTime(item.endsAt)}
                                    </span>
                                ) : (
                                    <span>Em andamento</span>
                                )}
                            </span>
                        </span>
                        <StatusBadge status={state} />
                        {onOpen && (
                            <Icon name="chevronRight" className="row-chevron" />
                        )}
                    </>
                );
                return (
                    <li key={item.id}>
                        {onOpen ? (
                            <button
                                className="movement-row"
                                disabled={Boolean(snapshot.pendingChange)}
                                onClick={() => onOpen(item)}
                                aria-label={`Detalhes da movimentação: ${key?.name ?? item.keyId}, ${item.borrower}`}
                            >
                                {content}
                            </button>
                        ) : (
                            <div className="movement-row">{content}</div>
                        )}
                    </li>
                );
            })}
        </ol>
    );
}
