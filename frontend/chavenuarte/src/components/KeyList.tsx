import { useState } from 'react';
import { can } from '../permissions/access';
import {
    futureBookings,
    formatDateTime,
    keyStatus,
    locationLabel,
} from '../services/selectors';
import { rulesSummary } from '../services/rules';
import type { DashboardSnapshot, Key, KeyStatus, Role } from '../types/domain';
import type { OperationKind } from './OperationDialog';
import { Dialog } from './Dialog';
import { EmptyState } from './States';
import { Icon } from './Icon';
import { StatusBadge } from './StatusBadge';
export function KeyList({
    snapshot,
    role,
    limit,
    query = '',
    filter = 'all',
    onOperate,
    onEdit,
    onBlock,
    onArchive,
    onHistory,
}: {
    snapshot: DashboardSnapshot;
    role: Role;
    limit?: number;
    query?: string;
    filter?: KeyStatus | 'all';
    onOperate: (kind: OperationKind, keyId: number) => void;
    onEdit?: (key: Key) => void;
    onBlock?: (key: Key) => void;
    onArchive?: (key: Key) => void;
    onHistory: (keyId: number) => void;
}) {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const selected = snapshot.keys.find((key) => key.id === selectedId);
    const keys = snapshot.keys
        .filter(
            (key) =>
                (filter === 'inactive' ? !key.active : key.active) &&
                `${key.name} ${key.code} ${locationLabel(key, snapshot)}`
                    .toLocaleLowerCase('pt-BR')
                    .includes(query.toLocaleLowerCase('pt-BR')) &&
                (filter === 'all' || keyStatus(key, snapshot) === filter),
        )
        .slice(0, limit);
    const status = selected ? keyStatus(selected, snapshot) : 'available';
    const rules = selected ? rulesSummary(selected.rules) : [];
    return (
        <>
            {keys.length ? (
                <div className="key-list">
                    {keys.map((key) => {
                        const bookings = futureBookings(key.id, snapshot);
                        return (
                            <button
                                key={key.id}
                                className="key-row"
                                aria-label={`Ver detalhes: ${key.name}`}
                                disabled={Boolean(snapshot.pendingChange)}
                                onClick={() => setSelectedId(key.id)}
                            >
                                <span
                                    className={`key-icon key-icon-${keyStatus(key, snapshot)}`}
                                >
                                    <Icon name="keys" />
                                </span>
                                <span className="key-description">
                                    <strong>{key.name}</strong>
                                    <span>
                                        {key.code} ·{' '}
                                        {locationLabel(key, snapshot)}
                                    </span>
                                    {bookings.length > 0 && (
                                        <span className="booking-hint">
                                            <Icon name="calendar" />
                                            {bookings.length === 1
                                                ? 'Agendamento futuro'
                                                : `${bookings.length} agendamentos futuros`}
                                        </span>
                                    )}
                                </span>
                                <StatusBadge
                                    status={keyStatus(key, snapshot)}
                                />
                                <Icon
                                    name="chevronRight"
                                    className="row-chevron"
                                />
                            </button>
                        );
                    })}
                </div>
            ) : (
                <EmptyState
                    title="Nenhuma chave encontrada"
                    description="Tente outra busca ou ajuste o filtro."
                />
            )}
            {selected && (
                <Dialog
                    title={selected.name}
                    onClose={() => setSelectedId(null)}
                >
                    <div className="dialog-body key-detail">
                        <div className="detail-top">
                            <span className="key-code">{selected.code}</span>
                            <StatusBadge status={status} />
                        </div>
                        <p>
                            {selected.description || 'Sem descrição adicional.'}
                        </p>
                        <dl className="summary-list">
                            <div>
                                <dt>Sala / espaço</dt>
                                <dd>{locationLabel(selected, snapshot)}</dd>
                            </div>
                            {selected.block && (
                                <div>
                                    <dt>
                                        Bloqueio{' '}
                                        {selected.block.kind === 'temporary'
                                            ? 'temporário'
                                            : 'permanente'}
                                    </dt>
                                    <dd>
                                        {selected.block.reason}
                                        {selected.block.kind ===
                                            'temporary' && (
                                            <small>
                                                {formatDateTime(
                                                    selected.block.startsAt!,
                                                )}{' '}
                                                até{' '}
                                                {formatDateTime(
                                                    selected.block.endsAt!,
                                                )}
                                            </small>
                                        )}
                                    </dd>
                                </div>
                            )}
                        </dl>
                        {selected.active && can(role, 'operate') && (
                            <div className="detail-actions">
                                {status === 'in_use' ? (
                                    <button
                                        className="button button-primary"
                                        disabled={Boolean(
                                            snapshot.pendingChange,
                                        )}
                                        onClick={() => {
                                            setSelectedId(null);
                                            onOperate('return', selected.id);
                                        }}
                                    >
                                        Devolver chave
                                    </button>
                                ) : (
                                    <button
                                        className="button button-primary"
                                        disabled={
                                            status !== 'available' ||
                                            Boolean(snapshot.pendingChange)
                                        }
                                        onClick={() => {
                                            setSelectedId(null);
                                            onOperate(
                                                'withdrawal',
                                                selected.id,
                                            );
                                        }}
                                    >
                                        Retirar agora
                                    </button>
                                )}
                                <button
                                    className="button button-secondary"
                                    disabled={
                                        selected.block?.kind === 'permanent' ||
                                        Boolean(snapshot.pendingChange)
                                    }
                                    onClick={() => {
                                        setSelectedId(null);
                                        onOperate('schedule', selected.id);
                                    }}
                                >
                                    <Icon name="calendar" />
                                    Agendar retirada
                                </button>
                            </div>
                        )}
                        {status === 'blocked' && (
                            <p className="form-error">
                                A retirada está indisponível durante o bloqueio.
                            </p>
                        )}
                        <section className="detail-section">
                            <h3>Agendamentos</h3>
                            {futureBookings(selected.id, snapshot).length ? (
                                <ul className="plain-list">
                                    {futureBookings(selected.id, snapshot).map(
                                        (item) => (
                                            <li key={item.id}>
                                                <strong>
                                                    {formatDateTime(
                                                        item.startsAt,
                                                    )}{' '}
                                                    —{' '}
                                                    {formatDateTime(
                                                        item.endsAt,
                                                    )}
                                                </strong>
                                                <span>
                                                    {item.borrower} ·{' '}
                                                    {item.purpose}
                                                </span>
                                            </li>
                                        ),
                                    )}
                                </ul>
                            ) : (
                                <p>Sem agendamentos futuros.</p>
                            )}
                        </section>
                        <section className="detail-section">
                            <h3>Regras de acesso</h3>
                            {rules.length ? (
                                <ul>
                                    {rules.map((rule) => (
                                        <li key={rule}>{rule}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>
                                    Sem restrições específicas. Valem as regras
                                    globais.
                                </p>
                            )}
                        </section>
                        <div className="detail-actions">
                            <button
                                className="button button-secondary"
                                onClick={() => {
                                    setSelectedId(null);
                                    onHistory(selected.id);
                                }}
                            >
                                Histórico da chave
                            </button>
                            {can(role, 'manageKeys') &&
                                selected.active &&
                                onEdit &&
                                onBlock &&
                                onArchive && (
                                    <>
                                        <button
                                            className="button button-secondary"
                                            disabled={Boolean(
                                                snapshot.pendingChange,
                                            )}
                                            onClick={() => {
                                                setSelectedId(null);
                                                onEdit?.(selected);
                                            }}
                                        >
                                            Editar chave
                                        </button>
                                        <button
                                            className="button button-secondary"
                                            disabled={Boolean(
                                                snapshot.pendingChange,
                                            )}
                                            onClick={() => {
                                                setSelectedId(null);
                                                onBlock?.(selected);
                                            }}
                                        >
                                            {selected.block
                                                ? 'Desbloquear chave'
                                                : 'Bloquear chave'}
                                        </button>
                                        <button
                                            className="button button-danger-quiet"
                                            disabled={Boolean(
                                                snapshot.pendingChange,
                                            )}
                                            onClick={() => {
                                                setSelectedId(null);
                                                onArchive?.(selected);
                                            }}
                                        >
                                            Arquivar chave
                                        </button>
                                    </>
                                )}
                        </div>
                    </div>
                </Dialog>
            )}
        </>
    );
}
