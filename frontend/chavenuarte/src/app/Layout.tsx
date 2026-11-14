import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Brand } from '../components/Brand';
import { Icon } from '../components/Icon';
import type { IconName } from '../components/Icon';
import { ThemeToggle } from '../components/ThemeToggle';
import { UserAvatar } from '../components/UserAvatar';
import { can, navigation, roleLabels } from '../permissions/access';
import type { Role, TeamMember, View } from '../types/domain';
const icons: Record<View, IconName> = {
    overview: 'overview',
    keys: 'keys',
    movements: 'movements',
    team: 'team',
    settings: 'settings',
    management: 'settings',
};
export const desktopLabels: Record<View, string> = {
    overview: 'Visão geral',
    keys: 'Chaves e espaços',
    movements: 'Movimentações',
    team: 'Equipe',
    settings: 'Configurações',
    management: 'Gestão',
};
const preferenceKey = 'chavenuarte.sidebar.compact';
export function Layout({
    role,
    user,
    view,
    navigate,
    children,
}: {
    role: Role;
    user: TeamMember;
    view: View;
    navigate: (view: View) => void;
    children: ReactNode;
}) {
    const [compact, setCompact] = useState(() => {
        try {
            return localStorage.getItem(preferenceKey) === 'true';
        } catch {
            return false;
        }
    });
    const mainRef = useRef<HTMLElement>(null);
    const previousView = useRef(view);
    useEffect(() => {
        if (previousView.current !== view) {
            mainRef.current?.focus();
            previousView.current = view;
        }
    }, [view]);
    const managementActive = ['team', 'settings', 'management'].includes(view);
    const mobileItems = [
        ...navigation
            .slice(0, 3)
            .filter((item) => can(role, item.permission))
            .map((item) => ({ view: item.view, label: item.label })),
        ...(can(role, 'manageTeam')
            ? [{ view: 'management' as const, label: 'Gestão' }]
            : []),
    ];
    function navItem(item: (typeof navigation)[number]) {
        return (
            <button
                key={item.view}
                className={`nav-item ${view === item.view ? 'is-active' : ''}`}
                aria-label={desktopLabels[item.view]}
                title={compact ? desktopLabels[item.view] : undefined}
                aria-current={view === item.view ? 'page' : undefined}
                onClick={() => navigate(item.view)}
            >
                <Icon name={icons[item.view]} />
                <span className="nav-label">{desktopLabels[item.view]}</span>
            </button>
        );
    }
    return (
        <div className={`app-shell ${compact ? 'sidebar-compact' : ''}`}>
            <a className="skip-link" href="#main-content">
                Ir para o conteúdo
            </a>
            <div className="sidebar-heading">
                <Brand
                    onNavigate={() => {
                        navigate('overview');
                        mainRef.current?.focus();
                    }}
                />
                <button
                    type="button"
                    className="sidebar-toggle"
                    aria-label={
                        compact
                            ? 'Expandir barra lateral'
                            : 'Recolher barra lateral'
                    }
                    aria-expanded={!compact}
                    aria-controls="desktop-sidebar"
                    onClick={() => {
                        const next = !compact;
                        setCompact(next);
                        try {
                            localStorage.setItem(preferenceKey, String(next));
                        } catch {
                            /* Visual preference only. */
                        }
                    }}
                >
                    <Icon name={compact ? 'chevronRight' : 'chevronLeft'} />
                </button>
            </div>
            <header className="topbar">
                <nav className="breadcrumb" aria-label="Caminho da página">
                    <ol>
                        <li>Gestão de espaços</li>
                        <li aria-current="page">{desktopLabels[view]}</li>
                    </ol>
                </nav>
                <div className="header-actions">
                    <ThemeToggle />
                    <div className="profile">
                        <UserAvatar user={user} />
                        <div className="profile-details">
                            <strong>{user.name}</strong>
                            <span>{roleLabels[role]}</span>
                        </div>
                    </div>
                </div>
            </header>
            <aside
                id="desktop-sidebar"
                className="sidebar"
                aria-label="Barra lateral"
            >
                <span className="sidebar-label">Área de trabalho</span>
                <nav aria-label="Navegação principal">
                    {navigation
                        .filter(
                            (item) =>
                                item.view !== 'settings' &&
                                can(role, item.permission),
                        )
                        .map(navItem)}
                </nav>
                {can(role, 'manageSettings') && (
                    <nav
                        className="sidebar-footer"
                        aria-label="Navegação administrativa"
                    >
                        {navigation
                            .filter((item) => item.view === 'settings')
                            .map(navItem)}
                    </nav>
                )}
            </aside>
            <main
                id="main-content"
                ref={mainRef}
                tabIndex={-1}
                className="main-content"
            >
                {children}
            </main>
            <nav className="bottom-nav" aria-label="Navegação inferior">
                {mobileItems.map((item) => {
                    const active =
                        item.view === 'management'
                            ? managementActive
                            : view === item.view;
                    return (
                        <button
                            key={item.view}
                            className={active ? 'is-active' : ''}
                            aria-current={active ? 'page' : undefined}
                            onClick={() => navigate(item.view)}
                        >
                            <Icon name={icons[item.view]} />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
