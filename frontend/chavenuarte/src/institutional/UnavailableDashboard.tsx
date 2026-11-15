import { useEffect, useState } from 'react';
import { Layout, desktopLabels } from '../app/Layout';
import { Icon } from '../components/Icon';
import type { IconName } from '../components/Icon';
import type { View } from '../types/domain';

const operationReason = 'Identidade, permissões e dados de chaves não estão disponíveis para confirmar esta operação.';

function UnavailableData({ title, children }: { title: string; children: string }) {
    return <div className="empty-state" role="status">
        <Icon name="info" />
        <h3>{title}</h3>
        <p>{children}</p>
    </div>;
}
function DisabledAction({ children, icon = 'lock', reason = operationReason, primary = false }: { children: string; icon?: IconName; reason?: string; primary?: boolean }) {
    return <button className={`button ${primary ? 'button-primary' : 'button-secondary'}`} disabled title={reason}>
        <Icon name={icon} />{children}
    </button>;
}
function KeyDataPanel() {
    return <UnavailableData title="Dados de chaves indisponíveis">
        A consulta de chaves e espaços ainda não está disponível. Não é possível confirmar disponibilidade, editar chaves ou registrar operações.
    </UnavailableData>;
}
function MovementDataPanel() {
    return <UnavailableData title="Histórico indisponível">
        As reservas e movimentações não foram disponibilizadas. Não é possível consultar retiradas, devoluções ou agendamentos.
    </UnavailableData>;
}

// No fake snapshot: missing counts, identities, rules and permissions stay unknown.
// These views expose the approved navigation, never institutional records/actions.
export function UnavailableDashboard({ suapIdentifier }: { suapIdentifier: string | null }) {
    const [view, setView] = useState<View>('overview');
    useEffect(() => { document.title = `ChaveNUARTE · ${desktopLabels[view]}`; }, [view]);
    return <Layout role={null} user={null} suapIdentifier={suapIdentifier} view={view} navigate={setView}>
        <div className="page-heading">
            <h1>{desktopLabels[view]}</h1>
            {['overview', 'keys'].includes(view) && <div className="heading-actions">
                <DisabledAction icon="keys" primary>Retirar chave</DisabledAction>
                <DisabledAction icon="arrowDown">Devolver chave</DisabledAction>
            </div>}
        </div>
        <p className="field-hint" role="note">
            {suapIdentifier ? 'Nome, vínculo e cargo não informados.' : 'Identidade e cargo não informados.'} As operações que exigem esses dados permanecem desabilitadas.
        </p>
        <div className="page-body">
            {view === 'overview' && <>
                <section className="stats-grid" aria-label="Resumo de chaves">
                    {[
                        { label: 'Total de chaves', icon: 'brandKey', tone: 'neutral' },
                        { label: 'Disponíveis', icon: 'check', tone: 'green' },
                        { label: 'Em uso', icon: 'clock', tone: 'amber' },
                    ].map((stat) => <article key={stat.label} className={`stat-card stat-${stat.tone}`}>
                        <span className="stat-icon"><Icon name={stat.icon as IconName} /></span>
                        <div><span>{stat.label}</span><strong className="stat-number" aria-label={`${stat.label}: não informado`}>—</strong></div>
                    </article>)}
                </section>
                <div className="overview-spaces-grid">
                <section className="panel">
                    <div className="panel-heading"><h2>Chaves e espaços</h2>
                        <button className="text-button" onClick={() => setView('keys')}>Ver todas<Icon name="arrow" /></button>
                    </div>
                    <KeyDataPanel />
                </section>
                <aside className="spaces-summary" aria-labelledby="spaces-summary-title">
                    <div><h2 id="spaces-summary-title">Nossos espaços</h2>
                        <p className="spaces-summary-count"><strong aria-label="Disponibilidade não informada">—</strong><span>disponibilidade não informada</span></p>
                    </div>
                    <p className="field-hint">A relação de espaços ainda não está disponível para consulta.</p>
                    <button className="text-button" onClick={() => setView('keys')}>Explorar espaços<Icon name="arrow" /></button>
                </aside>
                </div>
                <section className="panel">
                    <div className="panel-heading"><h2>Últimas movimentações</h2>
                        <button className="text-button" onClick={() => setView('movements')}>Ver histórico<Icon name="arrow" /></button>
                    </div>
                    <MovementDataPanel />
                </section>
            </>}
            {view === 'keys' && <section className="panel">
                <div className="catalog-toolbar">
                    <label className="search-field"><Icon name="search" /><span className="sr-only">Buscar chave ou espaço</span>
                        <input type="search" placeholder="Buscar chave, código ou sala" disabled title="A busca depende da consulta de chaves." />
                    </label>
                    <DisabledAction icon="plus">Nova chave</DisabledAction>
                    <DisabledAction icon="calendar">Agendar retirada</DisabledAction>
                    <DisabledAction icon="edit">Editar chave</DisabledAction>
                    <DisabledAction>Bloquear chave</DisabledAction>
                </div>
                <KeyDataPanel />
            </section>}
            {view === 'movements' && <section className="panel">
                <div className="panel-heading"><h2>Reservas e movimentações</h2></div>
                <MovementDataPanel />
            </section>}
            {view === 'team' && <section className="panel">
                <div className="panel-heading"><h2>Pessoas autorizadas</h2><DisabledAction icon="team" reason="A gestão de pessoas depende da identidade, das permissões e da relação de pessoas autorizadas.">Gerenciar pessoas</DisabledAction></div>
                <UnavailableData title="Equipe indisponível">
                    A relação de pessoas autorizadas e suas permissões não foi disponibilizada. Nenhum vínculo, cargo ou autorização pode ser alterado.
                </UnavailableData>
            </section>}
            {view === 'settings' && <section className="panel settings-panel">
                <h2>Regras globais de acesso</h2>
                <p className="field-hint">Valem para todas as chaves. As restrições específicas de cada chave se somam a estas regras.</p>
                <UnavailableData title="Regras de acesso indisponíveis">
                    Dias autorizados, horários, duração máxima e pessoas autorizadas não foram informados. Nenhuma configuração padrão foi aplicada.
                </UnavailableData>
                <DisabledAction icon="settings" primary reason="A alteração de regras depende da identidade, das permissões e das regras atuais.">Salvar regras globais</DisabledAction>
            </section>}
            {view === 'management' && <div className="management-links">
                <button onClick={() => setView('team')}><Icon name="team" /><div><strong>Equipe</strong><span>Cargos e permissões de acesso</span></div><Icon name="chevronRight" /></button>
                <button onClick={() => setView('settings')}><Icon name="settings" /><div><strong>Configurações</strong><span>Regras globais das chaves</span></div><Icon name="chevronRight" /></button>
            </div>}
        </div>
    </Layout>;
}
