import type { Permission, Role, TeamMember, View } from '../types/domain';
const common: Permission[] = ['overview', 'keys', 'movements', 'operate'];
const permissions: Record<Role, readonly Permission[]> = {
    supervisor: [
        ...common,
        'manageKeys',
        'manageTeam',
        'manageSettings',
        'supervise',
    ],
    admin: [...common, 'manageKeys', 'manageTeam', 'manageSettings'],
    bolsista: common,
    unauthorized: [],
};
export const roleLabels: Record<Role, string> = {
    supervisor: 'Supervisor',
    admin: 'Administrador',
    bolsista: 'Bolsista',
    unauthorized: 'Sem permissão',
};
export function can(role: Role, permission: Permission): boolean {
    return (
        Object.hasOwn(permissions, role) &&
        permissions[role].includes(permission)
    );
}
export function canManageMember(actor: Role, target: TeamMember): boolean {
    return (
        actor === 'supervisor' ||
        (actor === 'admin' &&
            (target.role === 'bolsista' || target.role === 'unauthorized'))
    );
}
export const navigation: {
    view: View;
    label: string;
    mobileLabel?: string;
    permission: Permission;
}[] = [
    { view: 'overview', label: 'Início', permission: 'overview' },
    { view: 'keys', label: 'Chaves', permission: 'keys' },
    { view: 'movements', label: 'Histórico', permission: 'movements' },
    { view: 'team', label: 'Equipe', permission: 'manageTeam' },
    { view: 'settings', label: 'Configurações', permission: 'manageSettings' },
];
export function canView(role: Role, view: View): boolean {
    if (view === 'management')
        return can(role, 'manageTeam') || can(role, 'manageSettings');
    const item = navigation.find((entry) => entry.view === view);
    return item ? can(role, item.permission) : false;
}
