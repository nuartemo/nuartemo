import { useState } from 'react';
import { RulesEditor } from '../components/RulesEditor';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { validateRules } from '../services/rules';
import type { DashboardSnapshot, KeyService } from '../types/domain';
export function Settings({
    snapshot,
    service,
}: {
    snapshot: DashboardSnapshot;
    service: KeyService;
}) {
    const [rules, setRules] = useState(() =>
        structuredClone(snapshot.globalRules),
    );
    const [confirm, setConfirm] = useState(false);
    const [error, setError] = useState('');
    return (
        <>
            <section className="panel settings-panel">
                <h2>Regras globais de acesso</h2>
                <p className="field-hint">
                    Valem para todas as chaves. As restrições específicas de
                    cada chave se somam a estas regras.
                </p>
                <form
                    noValidate
                    onSubmit={(event) => {
                        event.preventDefault();
                        setError('');
                        try {
                            validateRules(rules);
                            setConfirm(true);
                        } catch (cause) {
                            setError(
                                cause instanceof Error
                                    ? cause.message
                                    : 'Confira as regras.',
                            );
                        }
                    }}
                >
                    <RulesEditor
                        rules={rules}
                        onChange={setRules}
                        members={snapshot.team}
                    />
                    {error && (
                        <p className="form-error" role="alert">
                            {error}
                        </p>
                    )}
                    <button
                        type="submit"
                        className="button button-primary"
                        disabled={Boolean(snapshot.pendingChange)}
                    >
                        Salvar regras globais
                    </button>
                </form>
            </section>
            {confirm && (
                <ConfirmDialog
                    title="Alterar regras globais"
                    description="As novas regras serão aplicadas às próximas retiradas e agendamentos de todas as chaves. Registros existentes serão preservados. Você terá 5 segundos para desfazer."
                    onClose={() => setConfirm(false)}
                    onConfirm={async () => {
                        await service.stageAdmin({
                            type: 'global-rules',
                            rules,
                        });
                    }}
                />
            )}
        </>
    );
}
