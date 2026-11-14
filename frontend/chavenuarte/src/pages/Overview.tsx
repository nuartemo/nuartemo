import { Icon } from '../components/Icon';
import { KeyList } from '../components/KeyList';
import { MovementList } from '../components/MovementList';
import { SpacesSummary } from '../components/SpacesSummary';
import { keyStatus, reservationState } from '../services/selectors';
import type { DashboardSnapshot, Role, View } from '../types/domain';
import type { OperationKind } from '../components/OperationDialog';
export function Overview({
    snapshot,
    role,
    navigate,
    onOperate,
    onHistory,
}: {
    snapshot: DashboardSnapshot;
    role: Role;
    navigate: (view: View) => void;
    onOperate: (kind: OperationKind, keyId?: number) => void;
    onHistory: (keyId: number) => void;
}) {
    const active = snapshot.keys.filter((key) => key.active);
    const stats = [
        {
            label: 'Total de chaves',
            value: active.length,
            icon: 'brandKey' as const,
            tone: 'neutral',
        },
        {
            label: 'Disponíveis',
            value: active.filter(
                (key) => keyStatus(key, snapshot) === 'available',
            ).length,
            icon: 'check' as const,
            tone: 'green',
        },
        {
            label: 'Em uso',
            value: active.filter((key) => keyStatus(key, snapshot) === 'in_use')
                .length,
            icon: 'clock' as const,
            tone: 'amber',
        },
    ];
    const overdue = snapshot.reservations.filter(
        (item) => reservationState(item) === 'overdue',
    ).length;
    return (
        <>
            <section className="stats-grid" aria-label="Resumo de chaves">
                {stats.map((stat) => (
                    <article
                        key={stat.label}
                        className={`stat-card stat-${stat.tone}`}
                    >
                        <span className="stat-icon">
                            <Icon name={stat.icon} />
                        </span>
                        <div>
                            <span>{stat.label}</span>
                            <strong className="stat-number">
                                {stat.value}
                            </strong>
                        </div>
                    </article>
                ))}
            </section>
            {overdue > 0 && (
                <div className="warning-note">
                    <Icon name="clock" />
                    <span>
                        {overdue}{' '}
                        {overdue === 1
                            ? 'retirada com devolução atrasada.'
                            : 'retiradas com devolução atrasada.'}
                    </span>
                    <button
                        className="text-button"
                        onClick={() => navigate('movements')}
                    >
                        Ver histórico
                        <Icon name="arrow" />
                    </button>
                </div>
            )}
            <div className="overview-spaces-grid">
                <section className="panel">
                    <div className="panel-heading">
                        <h2>Chaves e espaços</h2>
                        <button
                            className="text-button"
                            onClick={() => navigate('keys')}
                        >
                            Ver todas
                            <Icon name="arrow" />
                        </button>
                    </div>
                    <KeyList
                        snapshot={snapshot}
                        role={role}
                        limit={4}
                        onOperate={onOperate}
                        onHistory={onHistory}
                    />
                </section>
                <SpacesSummary
                    snapshot={snapshot}
                    onExplore={() => navigate('keys')}
                />
            </div>
            <section className="panel">
                <div className="panel-heading">
                    <h2>Últimas movimentações</h2>
                    <button
                        className="text-button"
                        onClick={() => navigate('movements')}
                    >
                        Ver histórico
                        <Icon name="arrow" />
                    </button>
                </div>
                <MovementList snapshot={snapshot} limit={4} />
            </section>
        </>
    );
}
