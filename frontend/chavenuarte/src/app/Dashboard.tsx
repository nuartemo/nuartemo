import { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { AccessDenied, ErrorState, LoadingState } from '../components/States';
import { OperationDialog } from '../components/OperationDialog';
import type { OperationKind } from '../components/OperationDialog';
import { PendingNotice } from '../components/PendingNotice';
import { can, canView } from '../permissions/access';
import type {
    DashboardSnapshot,
    KeyService,
    Role,
    View,
} from '../types/domain';
import { Catalog } from '../pages/Catalog';
import { Overview } from '../pages/Overview';
import { Team } from '../pages/Team';
import { History } from '../pages/History';
import { Settings } from '../pages/Settings';
import { Layout } from './Layout';
import { PublicShell } from './PublicShell';
const titles: Record<View, string> = {
    overview: 'Visão geral',
    keys: 'Chaves e espaços',
    movements: 'Histórico',
    team: 'Equipe',
    settings: 'Configurações',
    management: 'Gestão',
};
const rank: Record<Role, number> = {
    unauthorized: 0,
    bolsista: 1,
    admin: 2,
    supervisor: 3,
};
export function Dashboard({
    role,
    service,
}: {
    role: Role;
    service: KeyService;
}) {
    const [view, setView] = useState<View>('overview');
    const [keyFilter, setKeyFilter] = useState<number | null>(null);
    const [state, setState] = useState<{
        status: 'loading' | 'error' | 'ready';
        data?: DashboardSnapshot;
    }>({ status: 'loading' });
    const [attempt, setAttempt] = useState(0);
    const [operation, setOperation] = useState<{
        kind: OperationKind;
        keyId?: number;
    } | null>(null);
    const [notice, setNotice] = useState<{
        kind: 'success' | 'error';
        message: string;
    } | null>(null);
    const allowed = can(role, 'overview');
    const sessionRole = state.data?.currentUser.role ?? role;
    const effectiveRole = rank[sessionRole] < rank[role] ? sessionRole : role;
    const visibleView = canView(effectiveRole, view) ? view : 'overview';
    useEffect(() => {
        if (!allowed) return;
        const controller = new AbortController();
        setState({ status: 'loading' });
        const unsubscribe = service.subscribe((event) => {
            setState({ status: 'ready', data: event.snapshot });
            if (event.error) setNotice({ kind: 'error', message: event.error });
            else if (event.message)
                setNotice({ kind: 'success', message: event.message });
            else setNotice(null);
        });
        service
            .load(controller.signal)
            .then((data) => {
                if (!controller.signal.aborted)
                    setState({ status: 'ready', data });
            })
            .catch(() => {
                if (!controller.signal.aborted) setState({ status: 'error' });
            });
        return () => {
            controller.abort();
            unsubscribe();
        };
    }, [service, allowed, attempt]);
    useEffect(() => {
        if (state.status !== 'ready' || !allowed) return;
        const controller = new AbortController();
        const timer = setInterval(() => {
            service
                .load(controller.signal)
                .then((data) => {
                    if (!controller.signal.aborted)
                        setState({ status: 'ready', data });
                })
                .catch(() => {});
        }, 30_000);
        return () => {
            clearInterval(timer);
            controller.abort();
        };
    }, [service, state.status, allowed]);
    useEffect(() => {
        document.title = `ChaveNUARTE · ${titles[visibleView]}`;
    }, [visibleView]);
    useEffect(() => {
        if (notice?.kind !== 'success') return;
        const timer = setTimeout(() => setNotice(null), 5000);
        return () => clearTimeout(timer);
    }, [notice]);
    function openOperation(kind: OperationKind, keyId?: number) {
        if (can(effectiveRole, 'operate')) setOperation({ kind, keyId });
    }
    function showHistory(keyId: number) {
        setKeyFilter(keyId);
        setView('movements');
    }
    const snapshot = state.data;
    const pending = snapshot?.pendingChange;
    if (!allowed || !can(effectiveRole, 'overview'))
        return (
            <>
                <PublicShell>
                    <AccessDenied />
                </PublicShell>
                {pending && (
                    <PendingNotice change={pending} service={service} />
                )}
            </>
        );
    const user = snapshot?.currentUser ?? {
        id: 0,
        name: 'Carregando…',
        registration: '',
        photoUrl: null,
        role,
        status: 'active' as const,
        suspendedUntil: null,
        shift: '',
    };
    return (
        <Layout
            role={effectiveRole}
            user={user}
            view={visibleView}
            navigate={(next) => {
                setView(next);
                if (next === 'movements') setKeyFilter(null);
            }}
        >
            <div className="page-heading">
                <h1>{titles[visibleView]}</h1>
                {can(effectiveRole, 'operate') &&
                    state.status === 'ready' &&
                    ['overview', 'keys'].includes(visibleView) && (
                        <div className="heading-actions">
                            <button
                                className="button button-primary"
                                disabled={Boolean(pending)}
                                onClick={() => openOperation('withdrawal')}
                            >
                                <Icon name="keys" />
                                Retirar chave
                            </button>
                            <button
                                className="button button-secondary"
                                disabled={Boolean(pending)}
                                onClick={() => openOperation('return')}
                            >
                                <Icon name="arrowDown" />
                                Devolver chave
                            </button>
                        </div>
                    )}
            </div>
            {notice && (
                <div
                    className={`notice notice-${notice.kind}`}
                    role={notice.kind === 'error' ? 'alert' : 'status'}
                >
                    <span>{notice.message}</span>
                    <button
                        className="icon-button"
                        aria-label="Dispensar confirmação"
                        onClick={() => setNotice(null)}
                    >
                        <Icon name="close" />
                    </button>
                </div>
            )}
            {state.status === 'loading' && <LoadingState />}
            {state.status === 'error' && (
                <ErrorState retry={() => setAttempt((value) => value + 1)} />
            )}
            {state.status === 'ready' && snapshot && (
                <div className="page-body" key={visibleView}>
                    {visibleView === 'overview' && (
                        <Overview
                            snapshot={snapshot}
                            role={effectiveRole}
                            navigate={setView}
                            onOperate={openOperation}
                            onHistory={showHistory}
                        />
                    )}
                    {visibleView === 'keys' && (
                        <Catalog
                            snapshot={snapshot}
                            role={effectiveRole}
                            service={service}
                            onOperate={openOperation}
                            onHistory={showHistory}
                        />
                    )}
                    {visibleView === 'movements' && (
                        <History
                            snapshot={snapshot}
                            service={service}
                            keyFilter={keyFilter}
                            onClearKeyFilter={() => setKeyFilter(null)}
                        />
                    )}
                    {visibleView === 'team' &&
                        can(effectiveRole, 'manageTeam') && (
                            <Team snapshot={snapshot} service={service} />
                        )}
                    {visibleView === 'settings' &&
                        can(effectiveRole, 'manageSettings') && (
                            <Settings
                                key={JSON.stringify(snapshot.globalRules)}
                                snapshot={snapshot}
                                service={service}
                            />
                        )}
                    {visibleView === 'management' &&
                        canView(effectiveRole, 'management') && (
                            <div className="management-links">
                                <button onClick={() => setView('team')}>
                                    <Icon name="team" />
                                    <div>
                                        <strong>Equipe</strong>
                                        <span>
                                            Cargos e permissões de acesso
                                        </span>
                                    </div>
                                    <Icon name="chevronRight" />
                                </button>
                                <button onClick={() => setView('settings')}>
                                    <Icon name="settings" />
                                    <div>
                                        <strong>Configurações</strong>
                                        <span>Regras globais das chaves</span>
                                    </div>
                                    <Icon name="chevronRight" />
                                </button>
                            </div>
                        )}
                </div>
            )}
            {operation && snapshot && can(effectiveRole, 'operate') && (
                <OperationDialog
                    kind={operation.kind}
                    keyId={operation.keyId}
                    snapshot={snapshot}
                    service={service}
                    onClose={() => setOperation(null)}
                    onComplete={(data, message) => {
                        setState({ status: 'ready', data });
                        setOperation(null);
                        setNotice({ kind: 'success', message });
                    }}
                />
            )}
            {pending && <PendingNotice change={pending} service={service} />}
        </Layout>
    );
}
