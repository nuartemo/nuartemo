import { useEffect, useState } from 'react';
import type { KeyService, PendingChange } from '../types/domain';
export function PendingNotice({
    change,
    service,
}: {
    change: PendingChange;
    service: KeyService;
}) {
    const [remaining, setRemaining] = useState(5);
    const [error, setError] = useState('');
    useEffect(() => {
        const update = () =>
            setRemaining(
                Math.max(0, Math.ceil((change.deadline - Date.now()) / 1000)),
            );
        update();
        const timer = setInterval(update, 200);
        return () => clearInterval(timer);
    }, [change.deadline]);
    return (
        <div className="pending-notice" role="status">
            <div>
                <strong>{change.label}</strong>
                <span>Alteração pendente por até 5 segundos.</span>
                {error && <span role="alert">{error}</span>}
            </div>
            <button
                className="button button-secondary"
                disabled={remaining === 0}
                onClick={async () => {
                    try {
                        await service.undoPending(change.id);
                    } catch (cause) {
                        setError(
                            cause instanceof Error
                                ? cause.message
                                : 'Não foi possível desfazer.',
                        );
                    }
                }}
            >
                Desfazer<span aria-hidden="true"> ({remaining}s)</span>
            </button>
        </div>
    );
}
