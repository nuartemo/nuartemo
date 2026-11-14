import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Layout } from './Layout';
import { createDemoSnapshot } from '../dev/fixtures';
import type { Role, View } from '../types/domain';
import { applyTheme } from '../theme/preference';
function layout(
    role: Role = 'admin',
    view: View = 'overview',
    navigate = vi.fn(),
) {
    const user = createDemoSnapshot(new Date(), role).currentUser;
    return (
        <Layout role={role} user={user} view={view} navigate={navigate}>
            <h1>Conteúdo da página</h1>
        </Layout>
    );
}
afterEach(() => {
    localStorage.clear();
    applyTheme('light');
});
describe('identidade e navegação institucional', () => {
    it('mantém uma única marca clicável e retorna à visão geral', async () => {
        const navigate = vi.fn();
        render(layout('bolsista', 'keys', navigate));
        await userEvent.click(
            screen.getByRole('link', { name: 'ChaveNUARTE — Visão geral' }),
        );
        expect(navigate).toHaveBeenCalledWith('overview');
        expect(document.querySelectorAll('.brand-name')).toHaveLength(1);
    });
    it.each<[View, string]>([
        ['overview', 'Visão geral'],
        ['keys', 'Chaves e espaços'],
        ['movements', 'Movimentações'],
        ['team', 'Equipe'],
        ['settings', 'Configurações'],
    ])('atualiza o breadcrumb em %s', (view, label) => {
        render(layout('admin', view));
        const breadcrumb = screen.getByRole('navigation', {
            name: 'Caminho da página',
        });
        expect(
            within(breadcrumb)
                .getAllByRole('listitem')
                .map((item) => item.textContent),
        ).toEqual(['Gestão de espaços', label]);
        expect(
            breadcrumb.querySelector('[aria-current="page"]'),
        ).toHaveTextContent(label);
    });
    it('mantém o controle de expansão junto à marca nos dois estados', async () => {
        render(layout());
        const button = screen.getByRole('button', {
            name: 'Recolher barra lateral',
        });
        expect(button.closest('.sidebar-heading')).toContainElement(
            screen.getByRole('link', { name: 'ChaveNUARTE — Visão geral' }),
        );
        await userEvent.click(button);
        expect(
            screen.getByRole('button', { name: 'Expandir barra lateral' }),
        ).toHaveAttribute('aria-expanded', 'false');
        await userEvent.click(
            screen.getByRole('button', { name: 'Expandir barra lateral' }),
        );
        expect(
            screen.getByRole('button', { name: 'Recolher barra lateral' }),
        ).toHaveAttribute('aria-expanded', 'true');
    });
    it('separa configurações no rodapé autorizado e preserva a navegação móvel', () => {
        render(layout());
        expect(
            within(
                screen.getByRole('navigation', { name: 'Navegação principal' }),
            ).queryByRole('button', { name: 'Configurações' }),
        ).not.toBeInTheDocument();
        expect(
            within(
                screen.getByRole('navigation', {
                    name: 'Navegação administrativa',
                }),
            ).getByRole('button', { name: 'Configurações' }),
        ).toBeInTheDocument();
        expect(
            within(
                screen.getByRole('navigation', { name: 'Navegação inferior' }),
            )
                .getAllByRole('button')
                .map((item) => item.textContent),
        ).toEqual(['Início', 'Chaves', 'Histórico', 'Gestão']);
    });
    it('oculta configurações e equipe de bolsistas sem afetar o tema', async () => {
        render(layout('bolsista'));
        expect(
            screen.queryByRole('navigation', {
                name: 'Navegação administrativa',
            }),
        ).not.toBeInTheDocument();
        await userEvent.click(
            screen.getByRole('button', { name: 'Ativar tema escuro' }),
        );
        expect(
            screen.queryByRole('button', { name: 'Equipe' }),
        ).not.toBeInTheDocument();
        expect(
            within(
                screen.getByRole('navigation', { name: 'Navegação inferior' }),
            ).getAllByRole('button'),
        ).toHaveLength(3);
    });
});
