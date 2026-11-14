import { useEffect, useMemo, useState } from 'react';
import { Dashboard } from '../app/Dashboard';
import { roleLabels } from '../permissions/access';
import type { Role } from '../types/domain';
import { createDemoService } from './demo-service';
import type { DemoScenario } from './demo-service';
export default function DevelopmentApp() {
    const [role, setRole] = useState<Role>('bolsista');
    const [scenario, setScenario] = useState<DemoScenario>('ready');
    const [revision, setRevision] = useState(0);
    const service = useMemo(
        () => createDemoService(scenario, { role }),
        [scenario, role, revision],
    );
    useEffect(() => () => service.dispose(), [service]);
    return (
        <>
            <Dashboard
                key={`${role}-${scenario}-${revision}`}
                role={role}
                service={service}
            />
            <details className="dev-tools">
                <summary aria-label="Ferramentas de desenvolvimento">
                    Simulação <span>· Dev</span>
                </summary>
                <div className="dev-popover">
                    <strong>Desenvolvimento</strong>
                    <p>
                        Ambiente simulado, sem integração institucional. As
                        alterações ficam nesta sessão.
                    </p>
                    <label>
                        Perfil
                        <select
                            aria-label="Perfil demonstrativo"
                            value={role}
                            onChange={(event) =>
                                setRole(event.target.value as Role)
                            }
                        >
                            {Object.entries(roleLabels).map(
                                ([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ),
                            )}
                        </select>
                    </label>
                    <label>
                        Cenário
                        <select
                            aria-label="Cenário demonstrativo"
                            value={scenario}
                            onChange={(event) =>
                                setScenario(event.target.value as DemoScenario)
                            }
                        >
                            <option value="ready">Com dados</option>
                            <option value="empty">Vazio</option>
                            <option value="loading">Carregando</option>
                            <option value="error">Erro ao carregar</option>
                            <option value="commit-error">
                                Falha ao concluir alteração
                            </option>
                        </select>
                    </label>
                    <button
                        className="button button-secondary"
                        onClick={() => setRevision((value) => value + 1)}
                    >
                        Reiniciar demonstração
                    </button>
                </div>
            </details>
        </>
    );
}
