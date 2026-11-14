import { Icon } from './Icon';
import { keyStatus } from '../services/selectors';
import type { DashboardSnapshot } from '../types/domain';
export function SpacesSummary({
    snapshot,
    onExplore,
}: {
    snapshot: DashboardSnapshot;
    onExplore: () => void;
}) {
    const active = snapshot.keys.filter((key) => key.active);
    const available = active.filter(
        (key) => keyStatus(key, snapshot) === 'available',
    ).length;
    const inUse = active.filter(
        (key) => keyStatus(key, snapshot) === 'in_use',
    ).length;
    const other = active.length - available - inUse;
    const percent = (value: number) =>
        active.length ? (value / active.length) * 100 : 0;
    return (
        <aside
            className="spaces-summary"
            aria-labelledby="spaces-summary-title"
        >
            <div>
                <h2 id="spaces-summary-title">Nossos espaços</h2>
                <p className="spaces-summary-count">
                    <strong>{available}</strong> de {active.length}
                    <span>chaves disponíveis</span>
                </p>
            </div>
            <div>
                <div
                    className="availability-bar"
                    role="meter"
                    aria-label="Disponibilidade de chaves"
                    aria-valuemin={0}
                    aria-valuemax={active.length || 1}
                    aria-valuenow={available}
                    aria-valuetext={`${available} de ${active.length} chaves ativas disponíveis`}
                >
                    <span
                        aria-hidden="true"
                        className="availability-available"
                        style={{ width: `${percent(available)}%` }}
                    />
                    <span
                        aria-hidden="true"
                        className="availability-in-use"
                        style={{ width: `${percent(inUse)}%` }}
                    />
                </div>
                <ul className="availability-legend">
                    <li>
                        <i aria-hidden="true" />
                        Disponíveis<strong>{available}</strong>
                    </li>
                    <li>
                        <i aria-hidden="true" />
                        Em uso<strong>{inUse}</strong>
                    </li>
                    {other > 0 && (
                        <li>
                            <i aria-hidden="true" />
                            Bloqueadas<strong>{other}</strong>
                        </li>
                    )}
                </ul>
            </div>
            <button type="button" className="text-button" onClick={onExplore}>
                Explorar espaços
                <Icon name="arrow" />
            </button>
        </aside>
    );
}
