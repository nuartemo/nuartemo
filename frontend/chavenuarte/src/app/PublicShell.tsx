import type { ReactNode } from 'react';
import { Brand } from '../components/Brand';
import { ThemeToggle } from '../components/ThemeToggle';
export function PublicShell({ children }: { children: ReactNode }) {
    return (
        <div className="production-shell">
            <header className="topbar">
                <Brand />
                <ThemeToggle />
            </header>
            <main>{children}</main>
        </div>
    );
}
