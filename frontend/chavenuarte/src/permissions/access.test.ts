import { describe, expect, it } from 'vitest';
import { can, canView } from './access';
import type { Permission, Role } from '../types/domain';

describe('permissões visuais', () => {
    it.each<[Role, boolean, boolean]>([
        ['supervisor', true, true],
        ['admin', true, false],
        ['bolsista', false, false],
        ['unauthorized', false, false],
    ])(
        '%s respeita os limites administrativos e de supervisão',
        (role, administrative, supervision) => {
            expect(can(role, 'manageTeam')).toBe(administrative);
            expect(can(role, 'manageKeys')).toBe(administrative);
            expect(can(role, 'supervise')).toBe(supervision);
            expect(canView(role, 'team')).toBe(administrative);
        },
    );

    it('nega todas as permissões ao perfil sem autorização', () => {
        const permissions: Permission[] = [
            'overview',
            'keys',
            'movements',
            'operate',
            'manageKeys',
            'manageTeam',
            'supervise',
        ];
        permissions.forEach((permission) =>
            expect(can('unauthorized', permission)).toBe(false),
        );
        expect(can('unknown' as Role, 'operate')).toBe(false);
    });

    it.each<Role>(['supervisor', 'admin', 'bolsista'])(
        '%s pode consultar e simular operações',
        (role) => {
            expect(can(role, 'operate')).toBe(true);
            expect(canView(role, 'keys')).toBe(true);
            expect(canView(role, 'movements')).toBe(true);
        },
    );
});
