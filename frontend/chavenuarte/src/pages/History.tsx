import { useState } from 'react';
import { MovementList } from '../components/MovementList';
import { Dialog } from '../components/Dialog';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { StatusBadge } from '../components/StatusBadge';
import { can } from '../permissions/access';
import {
    formatDateTime,
    reservationLabels,
    reservationState,
} from '../services/selectors';
import { localNow, parseLocal } from '../services/date-time';
import type {
    DashboardSnapshot,
    KeyService,
    Reservation,
    ReservationState,
} from '../types/domain';
export function History({
    snapshot,
    service,
    keyFilter,
    onClearKeyFilter,
}: {
    snapshot: DashboardSnapshot;
    service: KeyService;
    keyFilter: number | null;
    onClearKeyFilter: () => void;
}) {
    const [status, setStatus] = useState<ReservationState | 'all'>('all');
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [action, setAction] = useState<{
        reservation: Reservation;
        kind: 'checkout' | 'cancel';
    } | null>(null);
    const selected = snapshot.reservations.find(
        (item) => item.id === selectedId,
    );
    const invalid = Boolean(from && to && from > to);
    const items = invalid
        ? []
        : snapshot.reservations.filter(
              (item) =>
                  (keyFilter === null || item.keyId === keyFilter) &&
                  (status === 'all' || reservationState(item) === status) &&
                  (!from ||
                      (item.returnedAt ?? item.endsAt).slice(0, 10) >= from) &&
                  (!to || item.startsAt.slice(0, 10) <= to),
          );
    return (
        <>
            <section className="panel">
                {keyFilter !== null && (
                    <div className="filter-notice">
                        <span>
                            Chave:{' '}
                            <strong>
                                {
                                    snapshot.keys.find(
                                        (key) => key.id === keyFilter,
                                    )?.name
                                }
                            </strong>
                        </span>
                        <button
                            className="text-button"
                            onClick={onClearKeyFilter}
                        >
                            Limpar filtro de chave
                        </button>
                    </div>
                )}
                <div className="history-filters">
                    <label>
                        Estado
                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(
                                    event.target.value as
                                        | ReservationState
                                        | 'all',
                                )
                            }
                        >
                            <option value="all">Todos os estados</option>
                            {Object.entries(reservationLabels).map(
                                ([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ),
                            )}
                        </select>
                    </label>
                    <label>
                        De
                        <input
                            type="date"
                            aria-label="Período: de"
                            value={from}
                            onChange={(event) => setFrom(event.target.value)}
                        />
                    </label>
                    <label>
                        Até
                        <input
                            type="date"
                            aria-label="Período: até"
                            value={to}
                            min={from || undefined}
                            onChange={(event) => setTo(event.target.value)}
                        />
                    </label>
                    {(status !== 'all' || from || to) && (
                        <button
                            className="text-button"
                            onClick={() => {
                                setStatus('all');
                                setFrom('');
                                setTo('');
                            }}
                        >
                            Limpar filtros
                        </button>
                    )}
                </div>
                {invalid && (
                    <p className="form-error filter-error" role="alert">
                        A data final deve ser igual ou posterior à inicial.
                    </p>
                )}
                <MovementList
                    snapshot={snapshot}
                    reservations={items}
                    onOpen={(item) => setSelectedId(item.id)}
                />
            </section>
            {selected && (
                <Dialog
                    title="Detalhes da movimentação"
                    onClose={() => setSelectedId(null)}
                >
                    <div className="dialog-body">
                        <StatusBadge status={reservationState(selected)} />
                        <dl className="summary-list">
                            <div>
                                <dt>Chave</dt>
                                <dd>
                                    {
                                        snapshot.keys.find(
                                            (key) => key.id === selected.keyId,
                                        )?.name
                                    }
                                </dd>
                            </div>
                            <div>
                                <dt>Responsável</dt>
                                <dd>
                                    {selected.borrower} ·{' '}
                                    {selected.registration}
                                </dd>
                            </div>
                            <div>
                                <dt>Período reservado</dt>
                                <dd>
                                    {formatDateTime(selected.startsAt)} —{' '}
                                    {formatDateTime(selected.endsAt)}
                                </dd>
                            </div>
                            <div>
                                <dt>Retirada registrada</dt>
                                <dd>
                                    {selected.checkedOutAt
                                        ? formatDateTime(selected.checkedOutAt)
                                        : 'Ainda não realizada'}
                                </dd>
                            </div>
                            <div>
                                <dt>Devolução registrada</dt>
                                <dd>
                                    {selected.returnedAt
                                        ? formatDateTime(selected.returnedAt)
                                        : selected.status === 'checked_out'
                                          ? 'Em andamento'
                                          : '—'}
                                </dd>
                            </div>
                            <div>
                                <dt>Finalidade</dt>
                                <dd>{selected.purpose}</dd>
                            </div>
                            {selected.notes && (
                                <div>
                                    <dt>Observações</dt>
                                    <dd>{selected.notes}</dd>
                                </div>
                            )}
                            {selected.returnNotes && (
                                <div>
                                    <dt>Observação da devolução</dt>
                                    <dd>{selected.returnNotes}</dd>
                                </div>
                            )}
                        </dl>
                        {selected.status === 'approved' &&
                            (selected.operatorId === snapshot.currentUser.id ||
                                can(
                                    snapshot.currentUser.role,
                                    'manageKeys',
                                )) && (
                                <>
                                    <p className="field-hint">
                                        A retirada só será liberada dentro do
                                        período agendado.
                                    </p>
                                    <div className="detail-actions">
                                        <button
                                            className="button button-primary"
                                            disabled={
                                                Boolean(
                                                    snapshot.pendingChange,
                                                ) ||
                                                parseLocal(selected.startsAt) >
                                                    parseLocal(localNow()) ||
                                                parseLocal(selected.endsAt) <=
                                                    parseLocal(localNow())
                                            }
                                            onClick={() => {
                                                setSelectedId(null);
                                                setAction({
                                                    reservation: selected,
                                                    kind: 'checkout',
                                                });
                                            }}
                                        >
                                            Retirar agendamento
                                        </button>
                                        <button
                                            className="button button-danger-quiet"
                                            disabled={Boolean(
                                                snapshot.pendingChange,
                                            )}
                                            onClick={() => {
                                                setSelectedId(null);
                                                setAction({
                                                    reservation: selected,
                                                    kind: 'cancel',
                                                });
                                            }}
                                        >
                                            Cancelar agendamento
                                        </button>
                                    </div>
                                </>
                            )}
                    </div>
                </Dialog>
            )}
            {action && (
                <ConfirmDialog
                    title={
                        action.kind === 'cancel'
                            ? 'Cancelar agendamento'
                            : 'Retirar agendamento'
                    }
                    description={
                        action.kind === 'cancel'
                            ? 'O período será liberado e o registro ficará como cancelado. Você terá 5 segundos para desfazer.'
                            : 'A retirada física será registrada com o horário atual. Confirme que a chave está sendo entregue.'
                    }
                    confirmLabel={
                        action.kind === 'cancel'
                            ? 'Confirmar cancelamento'
                            : 'Confirmar retirada'
                    }
                    danger={action.kind === 'cancel'}
                    onClose={() => setAction(null)}
                    onConfirm={async () => {
                        if (action.kind === 'cancel')
                            await service.cancelReservation(
                                action.reservation.id,
                            );
                        else
                            await service.checkoutReservation(
                                action.reservation.id,
                            );
                    }}
                />
            )}
        </>
    );
}
