import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

export class ErrorBoundary extends Component<
    { children: ReactNode },
    { failed: boolean }
> {
    state = { failed: false };
    static getDerivedStateFromError() {
        return { failed: true };
    }
    componentDidCatch(_error: Error, _info: ErrorInfo) {
        /* Do not expose session data in error output. */
    }
    render() {
        if (this.state.failed)
            return (
                <main className="access-state" role="alert">
                    <h1>Não foi possível abrir a interface</h1>
                    <p>Recarregue a página para tentar novamente.</p>
                    <button
                        className="button button-primary"
                        onClick={() => window.location.reload()}
                    >
                        Recarregar página
                    </button>
                </main>
            );
        return this.props.children;
    }
}
