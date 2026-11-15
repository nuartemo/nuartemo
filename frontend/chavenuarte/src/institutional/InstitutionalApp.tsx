import { lazy, Suspense, useEffect, useState } from 'react';
import { ErrorState, LoadingState } from '../components/States';
import { PublicShell } from '../app/PublicShell';
import { connectInstitutionalPanel } from './connection';
import type { InstitutionalConnection } from './connection';
import { UnavailableDashboard } from './UnavailableDashboard';

// Preserve every approved screen in an institutional chunk without the demo graph.
const Dashboard = lazy(() => import('../app/Dashboard').then((module) => ({ default: module.Dashboard })));

export default function InstitutionalApp() {
    const [connection, setConnection] = useState<InstitutionalConnection | null>(null);
    const [failed, setFailed] = useState(false);
    const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        const controller = new AbortController();
        let active: InstitutionalConnection | null = null;
        setFailed(false);
        setConnection(null);
        connectInstitutionalPanel(controller.signal).then((result) => {
            if (controller.signal.aborted) {
                if (result.status === 'ready') result.service.dispose();
                return;
            }
            active = result;
            setConnection(result);
        }).catch(() => {
            if (!controller.signal.aborted) setFailed(true);
        });
        return () => {
            controller.abort();
            if (active?.status === 'ready') active.service.dispose();
        };
    }, [attempt]);
    if (connection?.status === 'ready')
        return <Suspense fallback={<PublicShell><LoadingState /></PublicShell>}>
            <Dashboard role={connection.role} service={connection.service} />
        </Suspense>;
    if (connection?.status === 'pending') return <UnavailableDashboard suapIdentifier={connection.suapIdentifier} />;
    return <PublicShell>
        {failed ? <ErrorState retry={() => setAttempt((value) => value + 1)} />
            : <LoadingState />}
    </PublicShell>;
}
