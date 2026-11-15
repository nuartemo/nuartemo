import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import InstitutionalApp from './InstitutionalApp';

afterEach(() => { localStorage.clear(); vi.restoreAllMocks(); document.getElementById('chavenuarte-v2-root')?.remove(); });
it('abre a interface V2 com identidade desconhecida e dados indisponíveis, sem substituir por demo', async () => {
    const request = vi.spyOn(globalThis, 'fetch');
    render(<InstitutionalApp />);
    expect(await screen.findByRole('heading', { name: 'Visão geral', level: 1 })).toBeVisible();
    expect(screen.queryByText('Aguardando integração institucional')).not.toBeInTheDocument();
    expect(screen.getByText('Identidade indisponível')).toBeVisible();
    expect(screen.getByText('Cargo não informado')).toBeVisible();
    expect(within(screen.getByLabelText('Resumo de chaves')).getAllByText('—')).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Retirar chave' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Devolver chave' })).toBeDisabled();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(request).not.toHaveBeenCalled();
});
it('permite navegar em todas as telas e identificar cada dependência sem executar operações', async () => {
    const request = vi.spyOn(globalThis, 'fetch');
    render(<InstitutionalApp />);
    await screen.findByRole('heading', { name: 'Visão geral', level: 1 });
    const navigate = async (label: string, administrative = false) => {
        await userEvent.click(within(screen.getByRole('navigation', {
            name: administrative ? 'Navegação administrativa' : 'Navegação principal',
        })).getByRole('button', { name: label }));
        expect(screen.getByRole('heading', { name: label, level: 1 })).toBeVisible();
    };
    await navigate('Chaves e espaços');
    expect(screen.getByRole('heading', { name: 'Dados de chaves indisponíveis' })).toBeVisible();
    for (const name of ['Retirar chave', 'Devolver chave', 'Agendar retirada', 'Nova chave', 'Editar chave', 'Bloquear chave'])
        expect(screen.getByRole('button', { name })).toBeDisabled();
    await navigate('Movimentações');
    expect(screen.getByRole('heading', { name: 'Histórico indisponível' })).toBeVisible();
    await navigate('Equipe');
    expect(screen.getByRole('heading', { name: 'Equipe indisponível' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Gerenciar pessoas' })).toBeDisabled();
    await navigate('Configurações', true);
    expect(screen.getByRole('heading', { name: 'Regras de acesso indisponíveis' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Salvar regras globais' })).toBeDisabled();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('link', { name: 'ChaveNUARTE — Visão geral' }));
    expect(screen.getByRole('heading', { name: 'Visão geral', level: 1 })).toBeVisible();
    expect(request).not.toHaveBeenCalled();
});
it('um cargo manipulado no navegador não modifica a identidade nem habilita operações', async () => {
    localStorage.setItem('role', 'supervisor');
    render(<InstitutionalApp />);
    await screen.findByRole('heading', { name: 'Visão geral', level: 1 });
    expect(screen.getByText('Cargo não informado')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Retirar chave' })).toBeDisabled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('exibe apenas a identificação fornecida pela view, sem convertê-la em nome, cargo ou permissão', async () => {
    const root = document.createElement('div'); root.id = 'chavenuarte-v2-root';
    root.dataset.suapIdentifier = 'session-identifier-test'; document.body.append(root);
    render(<InstitutionalApp />);
    await screen.findByRole('heading', { name: 'Visão geral', level: 1 });
    expect(screen.getByText('Identificação SUAP')).toBeVisible();
    expect(screen.getByText('session-identifier-test')).toBeVisible();
    expect(screen.getByText(/Nome, vínculo e cargo não informados/)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Retirar chave' })).toBeDisabled();
});
