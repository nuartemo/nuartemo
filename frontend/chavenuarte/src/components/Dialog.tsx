import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { Icon } from './Icon';

export function Dialog({
    title,
    children,
    onClose,
}: {
    title: string;
    children: ReactNode;
    onClose: () => void;
}) {
    const ref = useRef<HTMLDialogElement>(null);
    const returnFocus = useRef<HTMLElement | null>(null);
    const titleId = useId();
    useEffect(() => {
        const dialog = ref.current;
        returnFocus.current ??=
            document.activeElement instanceof HTMLElement &&
            document.activeElement !== document.body
                ? document.activeElement
                : document.getElementById('main-content');
        dialog?.showModal();
        return () => {
            dialog?.close();
            requestAnimationFrame(() => {
                if (!dialog?.open) {
                    const target = returnFocus.current?.isConnected
                        ? returnFocus.current
                        : document.getElementById('main-content');
                    target?.focus();
                }
            });
        };
    }, []);

    return (
        <dialog
            ref={ref}
            className="dialog"
            aria-labelledby={titleId}
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div className="dialog-heading">
                <h2 id={titleId}>{title}</h2>
                <button
                    className="icon-button"
                    aria-label="Fechar janela"
                    onClick={onClose}
                >
                    <Icon name="close" />
                </button>
            </div>
            {children}
        </dialog>
    );
}
