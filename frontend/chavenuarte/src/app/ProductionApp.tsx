import { AccessDenied } from '../components/States';
import { PublicShell } from './PublicShell';
export default function ProductionApp() {
    return (
        <PublicShell>
            <AccessDenied production />
        </PublicShell>
    );
}
