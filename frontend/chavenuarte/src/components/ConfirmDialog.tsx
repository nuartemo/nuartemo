import { useState } from 'react';
import type { ReactNode } from 'react';
import { Dialog } from './Dialog';
export function ConfirmDialog({
    title,
    description,
    children,
    confirmLabel = 'Confirmar alteração',
    danger = false,
    onConfirm,
    onClose,
}: {
    title: string;
    description: string;
    children?: ReactNode;
    confirmLabel?: string;
    danger?: boolean;
    onConfirm: () => Promise<void>;
    onClose: () => void;
}) {
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    return (
        <Dialog
            title={title}
            onClose={() => {
                if (!pending) onClose();
            }}
        >
            <div className="dialog-body">
                <p>{description}</p>
                {children}
                {error && (
                    <p role="alert" className="form-error">
                        {error}
                    </p>
                )}
                <div className="dialog-actions">
                    <button
                        className="button button-secondary"
                        disabled={pending}
                        onClick={onClose}
                    >
                        Voltar
                    </button>
                    <button
                        className={`button ${danger ? 'button-danger' : 'button-primary'}`}
                        disabled={pending}
                        onClick={async () => {
                            setPending(true);
                            setError('');
                            try {
                                await onConfirm();
                                onClose();
                            } catch (cause) {
                                setError(
                                    cause instanceof Error
                                        ? cause.message
                                        : 'Não foi possível concluir.',
                                );
                                setPending(false);
                            }
                        }}
                    >
                        {pending ? 'Aguarde…' : confirmLabel}
                    </button>
                </div>
            </div>
        </Dialog>
    );
}
