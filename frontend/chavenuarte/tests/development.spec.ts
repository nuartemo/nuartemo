import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const fixedTime = new Date('2026-11-14T13:00:00Z');
test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: fixedTime });
});
async function devOption(page: Page, label: string, value: string) {
    const tools = page.locator('.dev-tools');
    if ((await tools.getAttribute('open')) === null)
        await page.getByLabel('Ferramentas de desenvolvimento').click();
    await page.getByLabel(label, { exact: true }).selectOption(value);
    await page.getByLabel('Ferramentas de desenvolvimento').click();
}
async function navigate(page: Page, label: string) {
    const mobile = (page.viewportSize()?.width ?? 1440) < 768;
    if (mobile && ['Equipe', 'Configurações'].includes(label)) {
        await page
            .getByRole('navigation', { name: 'Navegação inferior' })
            .getByRole('button', { name: 'Gestão', exact: true })
            .click();
        await page
            .locator('.management-links')
            .getByRole('button', { name: new RegExp(`^${label}`) })
            .click();
    } else {
        const desktopNames: Record<string, string> = {
            Início: 'Visão geral',
            Chaves: 'Chaves e espaços',
            Histórico: 'Movimentações',
        };
        await page
            .getByRole('navigation', {
                name: mobile
                    ? 'Navegação inferior'
                    : label === 'Configurações'
                      ? 'Navegação administrativa'
                      : 'Navegação principal',
            })
            .getByRole('button', {
                name: mobile ? label : (desktopNames[label] ?? label),
                exact: true,
            })
            .click();
    }
}
async function noOverflow(page: Page) {
    expect(
        await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
    ).toBe(true);
}
async function axe(page: Page) {
    const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
    expect(
        result.violations.map((item) => ({
            id: item.id,
            nodes: item.nodes.map((node) => ({
                target: node.target,
                summary: node.failureSummary,
            })),
        })),
    ).toEqual([]);
}
async function settleChange(page: Page) {
    await expect(page.locator('.pending-notice')).toBeVisible();
    await page.clock.fastForward(5100);
    await expect(page.locator('.pending-notice')).toHaveCount(0);
}

test('prévia responsiva, perfis, teclado, operações e estados', async ({
    page,
}, testInfo) => {
    const errors: string[] = [];
    const external: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => {
        if (
            /^https?:/.test(request.url()) &&
            !request.url().startsWith('http://127.0.0.1:5174/')
        )
            external.push(request.url());
    });
    await page.goto('/');
    await expect(page.getByLabel('Resumo de chaves')).toBeVisible();
    await expect(
        page.getByRole('heading', { name: 'Visão geral', exact: true }),
    ).toBeVisible();
    await expect(
        page.getByLabel('Resumo de chaves').locator('article'),
    ).toHaveCount(3);
    await expect(page.locator('.brand-name')).toHaveCount(1);
    await expect(
        page.getByRole('button', { name: 'Abrir navegação' }),
    ).toHaveCount(0);
    for (const text of [
        'Acompanhamento da supervisão',
        'A arte ocupa.',
        'Feito para cuidar dos nossos espaços.',
        'Pessoas que cuidam',
        'Cada chave, uma possibilidade.',
        'Atualizado às',
    ])
        await expect(page.getByText(text, { exact: false })).toHaveCount(0);
    if ((page.viewportSize()?.width ?? 0) < 768) {
        const nav = page.getByRole('navigation', {
            name: 'Navegação inferior',
        });
        await expect(nav).toBeVisible();
        await expect(nav.getByRole('button')).toHaveText([
            'Início',
            'Chaves',
            'Histórico',
        ]);
    } else {
        await page
            .getByRole('button', { name: 'Recolher barra lateral' })
            .click();
        await expect(page.locator('.app-shell')).toHaveClass(/sidebar-compact/);
        await page.reload();
        await expect(
            page.getByRole('button', { name: 'Expandir barra lateral' }),
        ).toBeVisible();
        await page
            .getByRole('button', { name: 'Expandir barra lateral' })
            .click();
    }
    await noOverflow(page);
    await axe(page);
    await page.screenshot({
        path: testInfo.outputPath('visao-geral.png'),
        fullPage: true,
        animations: 'disabled',
    });
    const keyButton = page.getByRole('button', {
        name: 'Ver detalhes: Sala de música',
    });
    await keyButton.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    await axe(page);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(keyButton).toBeFocused();
    await devOption(page, 'Perfil demonstrativo', 'admin');
    await expect(page.getByLabel('Resumo de chaves')).toBeVisible();
    if ((page.viewportSize()?.width ?? 0) < 768)
        await expect(
            page
                .getByRole('navigation', { name: 'Navegação inferior' })
                .getByRole('button'),
        ).toHaveText(['Início', 'Chaves', 'Histórico', 'Gestão']);
    await navigate(page, 'Equipe');
    await expect(
        page.getByRole('heading', { name: 'Equipe', exact: true }),
    ).toBeVisible();
    await expect(
        page.getByRole('button', { name: 'Retirar chave', exact: true }),
    ).toHaveCount(0);
    await noOverflow(page);
    await axe(page);
    await page.screenshot({
        path: testInfo.outputPath('equipe.png'),
        fullPage: true,
        animations: 'disabled',
    });
    await devOption(page, 'Perfil demonstrativo', 'unauthorized');
    await expect(
        page.getByRole('heading', { name: 'Acesso não autorizado' }),
    ).toBeVisible();
    await expect(page.getByRole('navigation')).toHaveCount(0);
    await devOption(page, 'Perfil demonstrativo', 'bolsista');
    await devOption(page, 'Cenário demonstrativo', 'empty');
    await expect(page.getByText('Nenhuma chave encontrada')).toBeVisible();
    await devOption(page, 'Cenário demonstrativo', 'error');
    await expect(
        page.getByRole('button', { name: 'Tentar novamente' }),
    ).toBeVisible();
    await devOption(page, 'Cenário demonstrativo', 'loading');
    await expect(page.getByText('Carregando dados')).toBeVisible();
    await devOption(page, 'Cenário demonstrativo', 'ready');
    await expect(page.getByLabel('Resumo de chaves')).toBeVisible();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(
        await page
            .locator('.page-body')
            .evaluate((element) => getComputedStyle(element).animationName),
    ).toBe('none');
    expect(errors).toEqual([]);
    expect(external).toEqual([]);
});

test('retirada, devolução, agendamento, conflito, histórico e filtros', async ({
    page,
}, testInfo) => {
    await page.goto('/');
    await expect(page.getByLabel('Resumo de chaves')).toBeVisible();
    await page
        .getByRole('button', { name: 'Retirar chave', exact: true })
        .click();
    await page.getByLabel('Chave e espaço', { exact: true }).selectOption('4');
    await expect(page.getByLabel('Operador', { exact: true })).toHaveValue(
        'Joana Lima',
    );
    await expect(page.getByLabel('Matrícula', { exact: true })).toHaveValue(
        'DEMO-003',
    );
    await page
        .getByLabel('Finalidade', { exact: true })
        .fill('Ensaio de criação');
    await page.getByLabel('Devolução prevista: data').fill('2026-11-14');
    await page.getByLabel('Devolução prevista: horário').fill('15:99');
    await page.getByRole('button', { name: 'Continuar', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('23:59');
    await page.getByLabel('Devolução prevista: horário').fill('16:00');
    await page.getByRole('button', { name: 'Continuar', exact: true }).click();
    await axe(page);
    await page
        .getByRole('button', { name: 'Confirmar retirada', exact: true })
        .click();
    await expect(page.getByRole('status')).toContainText(
        'Retirada registrada.',
    );
    await page.clock.fastForward(61_000);
    await page
        .getByRole('button', { name: 'Devolver chave', exact: true })
        .click();
    await page.getByLabel('Chave e espaço', { exact: true }).selectOption('4');
    await expect(page.getByRole('dialog')).toContainText('Joana Lima');
    await page
        .getByLabel('Observação final (opcional)', { exact: true })
        .fill('Chave conferida');
    await page
        .getByRole('button', { name: 'Confirmar devolução', exact: true })
        .click();
    await expect(page.getByRole('status')).toContainText(
        'Devolução registrada.',
    );
    await navigate(page, 'Histórico');
    await expect(
        page.getByRole('button', { name: 'Retirar chave', exact: true }),
    ).toHaveCount(0);
    await page
        .getByRole('button', {
            name: 'Detalhes da movimentação: Estúdio de criação, Joana Lima',
        })
        .click();
    await expect(page.getByRole('dialog')).toContainText('Chave conferida');
    await expect(page.getByRole('dialog')).toContainText('10:01');
    await page.keyboard.press('Escape');
    await navigate(page, 'Chaves');
    await page
        .getByRole('button', { name: 'Ver detalhes: Estúdio de criação' })
        .click();
    await page
        .getByRole('button', { name: 'Agendar retirada', exact: true })
        .click();
    await page.getByLabel('Início previsto: data').fill('2026-11-15');
    await page.getByLabel('Início previsto: horário').fill('16:00');
    await page.getByLabel('Devolução prevista: data').fill('2026-11-15');
    await page.getByLabel('Devolução prevista: horário').fill('17:00');
    await page.getByLabel('Finalidade', { exact: true }).fill('Oficina');
    await page.getByRole('button', { name: 'Continuar', exact: true }).click();
    await expect(page.getByRole('dialog')).toContainText(
        'A retirada física será registrada separadamente',
    );
    await noOverflow(page);
    await page.screenshot({
        path: testInfo.outputPath('agendamento.png'),
        fullPage: true,
        animations: 'disabled',
    });
    await page
        .getByRole('button', { name: 'Confirmar agendamento', exact: true })
        .click();
    await expect(page.getByRole('status')).toContainText(
        'Agendamento confirmado.',
    );
    await expect(
        page.getByRole('button', { name: 'Ver detalhes: Estúdio de criação' }),
    ).toContainText('Disponível');
    await page
        .getByRole('button', { name: 'Ver detalhes: Estúdio de criação' })
        .click();
    await page
        .getByRole('button', { name: 'Agendar retirada', exact: true })
        .click();
    await page.getByLabel('Início previsto: data').fill('2026-11-15');
    await page.getByLabel('Início previsto: horário').fill('16:30');
    await page.getByLabel('Devolução prevista: data').fill('2026-11-15');
    await page.getByLabel('Devolução prevista: horário').fill('17:30');
    await page.getByLabel('Finalidade', { exact: true }).fill('Conflito');
    await page.getByRole('button', { name: 'Continuar', exact: true }).click();
    await page
        .getByRole('button', { name: 'Confirmar agendamento', exact: true })
        .click();
    await expect(page.getByRole('alert')).toContainText(
        'Já existe um agendamento',
    );
    await page.keyboard.press('Escape');
    await navigate(page, 'Histórico');
    await page
        .getByRole('combobox', { name: 'Estado', exact: true })
        .selectOption('scheduled');
    await page.getByLabel('Período: de').fill('2026-11-15');
    await page.getByLabel('Período: até').fill('2026-11-15');
    await expect(
        page.getByRole('button', {
            name: 'Detalhes da movimentação: Estúdio de criação, Joana Lima',
        }),
    ).toHaveCount(1);
    await noOverflow(page);
    await navigate(page, 'Chaves');
    await page.getByRole('searchbox').fill('dança');
    await expect(
        page.getByRole('button', { name: 'Ver detalhes: Sala de dança' }),
    ).toBeVisible();
    await page
        .getByLabel('Filtrar por disponibilidade')
        .selectOption('available');
    await expect(page.getByText('Nenhuma chave encontrada')).toBeVisible();
    await noOverflow(page);
});

test('gestão administrativa, proteções, edição, confirmação e desfazer', async ({
    page,
}, testInfo) => {
    test.setTimeout(90_000);
    await page.goto('/');
    await devOption(page, 'Perfil demonstrativo', 'supervisor');
    await expect(page.getByLabel('Resumo de chaves')).toBeVisible();
    await navigate(page, 'Equipe');
    await page.getByRole('button', { name: 'Gerenciar Alex Oliveira' }).click();
    await page
        .getByRole('combobox', { name: 'Ação', exact: true })
        .selectOption('revoke');
    await page.getByRole('button', { name: 'Continuar', exact: true }).click();
    await page
        .getByRole('button', { name: 'Confirmar alteração', exact: true })
        .click();
    await expect(page.getByRole('alert')).toContainText('supervisor ativo');
    await page.keyboard.press('Escape');
    await page
        .getByRole('searchbox', { name: 'Buscar nome ou matrícula' })
        .fill('DEMO-003');
    await page.getByRole('button', { name: 'Gerenciar Joana Lima' }).click();
    await page
        .getByRole('combobox', { name: 'Cargo', exact: true })
        .selectOption('admin');
    await page.getByRole('button', { name: 'Continuar', exact: true }).click();
    await page
        .getByRole('button', { name: 'Confirmar alteração', exact: true })
        .click();
    await expect(page.locator('.pending-notice')).toBeVisible();
    await page.getByRole('button', { name: /^Desfazer/ }).click();
    await expect(page.locator('.team-list')).toContainText('Bolsista');
    await page.getByRole('button', { name: 'Gerenciar Joana Lima' }).click();
    await page
        .getByRole('combobox', { name: 'Cargo', exact: true })
        .selectOption('admin');
    await page.getByRole('button', { name: 'Continuar', exact: true }).click();
    await page
        .getByRole('button', { name: 'Confirmar alteração', exact: true })
        .click();
    await settleChange(page);
    await expect(page.locator('.team-list')).toContainText('Administrador');
    await navigate(page, 'Chaves');
    await page.getByRole('button', { name: 'Nova chave', exact: true }).click();
    await page.getByLabel('Código', { exact: true }).fill('CH-09');
    await page
        .getByLabel('Nome da chave', { exact: true })
        .fill('Sala de leitura');
    await page
        .getByRole('combobox', { name: 'Sala / espaço', exact: true })
        .selectOption('1');
    await page.getByRole('button', { name: 'Continuar', exact: true }).click();
    await page
        .getByRole('button', { name: 'Confirmar criação', exact: true })
        .click();
    await settleChange(page);
    await page
        .getByRole('button', { name: 'Ver detalhes: Sala de leitura' })
        .click();
    await page
        .getByRole('button', { name: 'Editar chave', exact: true })
        .click();
    await page
        .getByLabel('Descrição (opcional)', { exact: true })
        .fill('Sala para reuniões');
    await page
        .getByRole('combobox', { name: 'Sala / espaço', exact: true })
        .selectOption('2');
    await page.getByText('Configurações avançadas', { exact: true }).click();
    await page
        .getByRole('checkbox', { name: 'Domingo', exact: true })
        .uncheck();
    await page.getByRole('button', { name: 'Adicionar faixa horária' }).click();
    await page.getByLabel('Faixa 1: início').fill('08:00');
    await page.getByLabel('Faixa 1: fim').fill('16:00');
    await page
        .getByLabel('Duração máxima (minutos)', { exact: true })
        .fill('90');
    await page.getByRole('checkbox', { name: /Joana Lima/ }).check();
    await noOverflow(page);
    await axe(page);
    await page.getByRole('button', { name: 'Continuar', exact: true }).click();
    await page
        .getByRole('button', { name: 'Confirmar edição', exact: true })
        .click();
    await settleChange(page);
    await page
        .getByRole('button', { name: 'Ver detalhes: Sala de leitura' })
        .click();
    await expect(page.getByRole('dialog')).toContainText('Sala para reuniões');
    await expect(page.getByRole('dialog')).toContainText('Até 90 minutos');
    await page
        .getByRole('button', { name: 'Bloquear chave', exact: true })
        .click();
    await page
        .getByLabel('Motivo do bloqueio', { exact: true })
        .fill('Revisão da fechadura');
    await page.getByRole('button', { name: 'Continuar', exact: true }).click();
    await page
        .getByRole('button', { name: 'Confirmar bloqueio', exact: true })
        .click();
    await page.getByRole('button', { name: /^Desfazer/ }).click();
    await expect(
        page.getByRole('button', { name: 'Ver detalhes: Sala de leitura' }),
    ).toContainText('Disponível');
    await page
        .getByRole('button', { name: 'Ver detalhes: Sala de leitura' })
        .click();
    await page
        .getByRole('button', { name: 'Arquivar chave', exact: true })
        .click();
    await expect(page.getByRole('dialog')).toContainText(
        'histórico será preservado',
    );
    await page
        .getByRole('button', { name: 'Confirmar arquivamento', exact: true })
        .click();
    await settleChange(page);
    await expect(
        page.getByRole('button', { name: 'Ver detalhes: Sala de leitura' }),
    ).toHaveCount(0);
    await page
        .getByLabel('Filtrar por disponibilidade')
        .selectOption('inactive');
    await expect(
        page.getByRole('button', { name: 'Ver detalhes: Sala de leitura' }),
    ).toContainText('Arquivada');
    await navigate(page, 'Configurações');
    await expect(
        page.getByRole('heading', { name: 'Regras globais de acesso' }),
    ).toBeVisible();
    await noOverflow(page);
    await page.screenshot({
        path: testInfo.outputPath('configuracoes.png'),
        fullPage: true,
        animations: 'disabled',
    });
    await devOption(page, 'Perfil demonstrativo', 'admin');
    await expect(page.getByLabel('Resumo de chaves')).toBeVisible();
    await navigate(page, 'Equipe');
    await expect(
        page.getByRole('button', { name: 'Gerenciar Alex Oliveira' }),
    ).toHaveCount(0);
    await page.getByRole('button', { name: 'Gerenciar Joana Lima' }).click();
    await expect(
        page
            .getByRole('combobox', { name: 'Cargo', exact: true })
            .locator('option'),
    ).toHaveText(['Bolsista', 'Sem permissão']);
    await page.keyboard.press('Escape');
    await devOption(page, 'Cenário demonstrativo', 'commit-error');
    await expect(page.getByLabel('Resumo de chaves')).toBeVisible();
    await navigate(page, 'Chaves');
    await page.getByRole('button', { name: 'Ver detalhes: Auditório' }).click();
    await page
        .getByRole('button', { name: 'Arquivar chave', exact: true })
        .click();
    await page
        .getByRole('button', { name: 'Confirmar arquivamento', exact: true })
        .click();
    await settleChange(page);
    await expect(page.getByRole('alert')).toContainText('restaurada');
    await expect(
        page.getByRole('button', { name: 'Ver detalhes: Auditório' }),
    ).toBeVisible();
});
