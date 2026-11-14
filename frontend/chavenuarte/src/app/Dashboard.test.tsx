import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Role } from '../types/domain';
import { createDemoSnapshot } from '../dev/fixtures';
import { createDemoService } from '../dev/demo-service';
import { Dashboard } from './Dashboard';
import ProductionApp from './ProductionApp';
function service(role: Role = 'supervisor') {
    const source = createDemoService('ready', { role });
    vi.spyOn(source, 'load').mockResolvedValue(
        createDemoSnapshot(new Date(), role),
    );
    return source;
}
const mainNav = () =>
    screen.getByRole('navigation', { name: 'Navegação principal' });
describe('interface e limites dos perfis', () => {
    it('mostra equipe e configurações ao supervisor, com a visão geral simplificada', async () => {
        render(<Dashboard role="supervisor" service={service()} />);
        await screen.findByLabelText('Resumo de chaves');
        expect(
            within(mainNav()).getByRole('button', { name: 'Equipe' }),
        ).toBeInTheDocument();
        expect(
            within(
                screen.getByRole('navigation', {
                    name: 'Navegação administrativa',
                }),
            ).getByRole('button', { name: 'Configurações' }),
        ).toBeInTheDocument();
        expect(
            within(screen.getByLabelText('Resumo de chaves')).getAllByRole(
                'article',
            ),
        ).toHaveLength(3);
        expect(
            screen.queryByText('Acompanhamento da supervisão'),
        ).not.toBeInTheDocument();
    });
    it('mostra equipe ao administrador sem repetir atalhos operacionais', async () => {
        render(<Dashboard role="admin" service={service('admin')} />);
        await screen.findByLabelText('Resumo de chaves');
        await userEvent.click(
            within(mainNav()).getByRole('button', { name: 'Equipe' }),
        );
        expect(
            await screen.findByRole('searchbox', {
                name: 'Buscar nome ou matrícula',
            }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', {
                name: 'Retirar chave',
            }),
        ).not.toBeInTheDocument();
    });
    it('restringe a equipe para bolsistas e mantém operações e três destinos móveis', async () => {
        render(<Dashboard role="bolsista" service={service('bolsista')} />);
        expect(
            await screen.findByRole('button', {
                name: 'Retirar chave',
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Devolver chave' }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Equipe' }),
        ).not.toBeInTheDocument();
        const mobile = screen.getByRole('navigation', {
            name: 'Navegação inferior',
        });
        expect(
            within(mobile)
                .getAllByRole('button')
                .map((button) => button.textContent),
        ).toEqual(['Início', 'Chaves', 'Histórico']);
    });
    it('nega o acesso sem carregar dados para um perfil não autorizado', () => {
        const source = service();
        render(<Dashboard role="unauthorized" service={source} />);
        expect(
            screen.getByRole('heading', { name: 'Acesso não autorizado' }),
        ).toBeInTheDocument();
        expect(source.load).not.toHaveBeenCalled();
        expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });
    it('exibe carregamento, erro e permite uma nova tentativa', async () => {
        const source = service('bolsista');
        vi.mocked(source.load).mockRejectedValueOnce(new Error('demo'));
        render(<Dashboard role="bolsista" service={source} />);
        expect(screen.getByText('Carregando dados')).toBeInTheDocument();
        await userEvent.click(
            await screen.findByRole('button', { name: 'Tentar novamente' }),
        );
        await screen.findByLabelText('Resumo de chaves');
        expect(source.load).toHaveBeenCalledTimes(2);
    });
    it('filtra o catálogo e informa quando nenhum resultado é encontrado', async () => {
        render(<Dashboard role="bolsista" service={service('bolsista')} />);
        await screen.findByLabelText('Resumo de chaves');
        await userEvent.click(
            within(mainNav()).getByRole('button', {
                name: 'Chaves e espaços',
            }),
        );
        await userEvent.type(
            screen.getByRole('searchbox', { name: 'Buscar chave ou espaço' }),
            'inexistente',
        );
        await waitFor(() =>
            expect(
                screen.getByText('Nenhuma chave encontrada'),
            ).toBeInTheDocument(),
        );
    });
    it('mantém a produção bloqueada mesmo com tentativas de sobrescrever perfil pelo navegador', () => {
        localStorage.setItem('role', 'supervisor');
        sessionStorage.setItem('role', 'admin');
        window.history.replaceState({}, '', '/?role=supervisor#admin');
        render(<ProductionApp />);
        expect(
            screen.getByRole('heading', {
                name: 'Aguardando integração institucional',
            }),
        ).toBeInTheDocument();
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Retirar chave' }),
        ).not.toBeInTheDocument();
        localStorage.clear();
        sessionStorage.clear();
        window.history.replaceState({}, '', '/');
    });
    it('persiste apenas a preferência visual da sidebar', async () => {
        localStorage.clear();
        const first = render(
            <Dashboard role="bolsista" service={service('bolsista')} />,
        );
        await screen.findByLabelText('Resumo de chaves');
        await userEvent.click(
            screen.getByRole('button', { name: 'Recolher barra lateral' }),
        );
        expect(localStorage.getItem('chavenuarte.sidebar.compact')).toBe(
            'true',
        );
        first.unmount();
        render(<Dashboard role="bolsista" service={service('bolsista')} />);
        await screen.findByLabelText('Resumo de chaves');
        expect(
            screen.getByRole('button', { name: 'Expandir barra lateral' }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Equipe' }),
        ).not.toBeInTheDocument();
        localStorage.clear();
    });
    it('remove os textos e marcas decorativos das telas principais', async () => {
        render(<Dashboard role="supervisor" service={service()} />);
        await screen.findByLabelText('Resumo de chaves');
        for (const text of [
            /A arte ocupa/i,
            /Núcleo de Arte e Cultura/i,
            /Fase 1/i,
            /Feito para cuidar/i,
            /cuidado.*coletivo/i,
            /Acompanhamento da supervisão/i,
            /Pessoas que cuidam/i,
            /Cada chave.*possibilidade/i,
            /espaço para criar/i,
            /ritmo dos espaços/i,
            /Prévia local/i,
            /dados fictícios/i,
            /cenário de demonstração/i,
            /Atualizado às/i,
        ])
            expect(screen.queryByText(text)).not.toBeInTheDocument();
        expect(document.querySelectorAll('.brand-name')).toHaveLength(1);
        expect(document.querySelector('.brand-name')).toHaveTextContent(
            'ChaveNUARTE',
        );
        expect(
            screen.queryByRole('button', { name: /Abrir navegação/i }),
        ).not.toBeInTheDocument();
    });
    it('não repete atalhos de retirada ou devolução no histórico', async () => {
        render(<Dashboard role="bolsista" service={service('bolsista')} />);
        await screen.findByLabelText('Resumo de chaves');
        await userEvent.click(
            within(mainNav()).getByRole('button', { name: 'Movimentações' }),
        );
        expect(
            screen.getByRole('combobox', { name: 'Estado' }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole('button', {
                name: 'Retirar chave',
            }),
        ).not.toBeInTheDocument();
        expect(screen.getAllByText(/Em andamento/).length).toBeGreaterThan(0);
    });
});
