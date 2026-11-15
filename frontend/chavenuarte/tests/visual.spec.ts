import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const brandName = 'ChaveNUARTE — Visão geral';
const mobile = (page: Page) => (page.viewportSize()?.width ?? 1440) < 768;
async function devOption(page: Page, label: string, value: string) {
    if ((await page.locator('.dev-tools').getAttribute('open')) === null)
        await page.getByLabel('Ferramentas de desenvolvimento').click();
    await page.getByLabel(label, { exact: true }).selectOption(value);
    await page.getByLabel('Ferramentas de desenvolvimento').click();
}
async function navigate(
    page: Page,
    view: 'overview' | 'keys' | 'movements' | 'team' | 'settings',
) {
    const names = {
        overview: 'Visão geral',
        keys: 'Chaves e espaços',
        movements: 'Movimentações',
        team: 'Equipe',
        settings: 'Configurações',
    };
    if (mobile(page)) {
        if (view === 'team' || view === 'settings') {
            await page
                .getByRole('navigation', { name: 'Navegação inferior' })
                .getByRole('button', { name: 'Gestão', exact: true })
                .click();
            await page
                .locator('.management-links')
                .getByRole('button', { name: new RegExp(`^${names[view]}`) })
                .click();
        } else {
            const short = {
                overview: 'Início',
                keys: 'Chaves',
                movements: 'Histórico',
            };
            await page
                .getByRole('navigation', { name: 'Navegação inferior' })
                .getByRole('button', { name: short[view], exact: true })
                .click();
        }
    } else
        await page
            .getByRole('navigation', {
                name:
                    view === 'settings'
                        ? 'Navegação administrativa'
                        : 'Navegação principal',
            })
            .getByRole('button', { name: names[view], exact: true })
            .click();
    if (!mobile(page))
        await expect(
            page.locator('.breadcrumb [aria-current="page"]'),
        ).toHaveText(names[view]);
}
async function theme(page: Page, value: 'light' | 'dark') {
    if ((await page.locator('html').getAttribute('data-theme')) !== value)
        await page
            .getByRole('button', {
                name:
                    value === 'dark'
                        ? 'Ativar tema escuro'
                        : 'Ativar tema claro',
            })
            .click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', value);
}
async function audit(page: Page) {
    const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
    expect(
        results.violations.map((item) => ({
            id: item.id,
            nodes: item.nodes.map((node) => ({
                target: node.target,
                message: node.failureSummary,
            })),
        })),
    ).toEqual([]);
    expect(
        await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
        ),
    ).toBe(true);
}
test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: new Date('2026-11-14T13:00:00Z') });
});

test('identidade, breadcrumb, sidebar e disponibilidade nos dois temas', async ({
    page,
}, testInfo) => {
    test.setTimeout(90_000);
    await page.goto('/');
    await expect(page.getByLabel('Resumo de chaves')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.getByRole('link', { name: brandName })).toHaveCount(1);
    const asset = await page.locator('link[rel="icon"]').getAttribute('href');
    expect(asset).toContain('chavenuarte-key.svg');
    await expect(page.locator('.brand use')).toHaveAttribute(
        'href',
        /chavenuarte-key.*\.svg#chavenuarte-key$/,
    );
    await expect(page.locator('.stat-neutral .stat-icon use')).toHaveAttribute(
        'href',
        /chavenuarte-key.*\.svg#chavenuarte-key$/,
    );
    await expect(page.locator('.key-icon use')).toHaveCount(4);
    await expect(page.locator('.brand-mark')).toHaveCSS(
        'background-color',
        'rgb(36, 114, 79)',
    );
    await expect(page.locator('.brand-mark svg')).toHaveCSS(
        'color',
        'rgb(255, 255, 255)',
    );
    const card = page.getByRole('complementary', { name: 'Nossos espaços' });
    const wide = (page.viewportSize()?.width ?? 0) >= 1280;
    if (wide) {
        await expect(card).toBeVisible();
        await expect(card.getByRole('meter')).toHaveAttribute(
            'aria-valuenow',
            '5',
        );
        await expect(card.getByRole('meter')).toHaveAttribute(
            'aria-valuemax',
            '7',
        );
        await card.getByRole('button', { name: 'Explorar espaços' }).click();
        await expect(
            page.getByRole('heading', {
                name: 'Chaves e espaços',
                exact: true,
            }),
        ).toBeVisible();
        await page.getByRole('link', { name: brandName }).click();
    } else await expect(page.locator('.spaces-summary')).toBeHidden();
    if (mobile(page)) {
        await expect(page.locator('.breadcrumb')).toBeHidden();
        await expect(
            page
                .getByRole('navigation', { name: 'Navegação inferior' })
                .getByRole('button'),
        ).toHaveText(['Início', 'Chaves', 'Histórico']);
        await expect(
            page.getByRole('button', { name: 'Expandir barra lateral' }),
        ).toHaveCount(0);
    } else {
        await expect(
            page
                .getByRole('navigation', { name: 'Navegação principal' })
                .getByRole('button'),
        ).toHaveText(['Visão geral', 'Chaves e espaços', 'Movimentações']);
        await expect(
            page.getByRole('button', { name: 'Recolher barra lateral' }),
        ).toBeVisible();
    }
    for (const value of ['light', 'dark'] as const) {
        await theme(page, value);
        const chrome = value === 'light' ? '#ffffff' : '#102219';
        await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
            'content',
            chrome,
        );
        const surfaces = await page.locator('.stat-card').evaluateAll((cards) =>
            cards.map((card) => {
                const style = getComputedStyle(card);
                return [style.backgroundColor, style.borderColor];
            }),
        );
        expect(surfaces[1]).toEqual(surfaces[0]);
        expect(surfaces[2]).toEqual(surfaces[0]);
        expect(
            await page
                .locator('.header-actions .profile')
                .evaluate((element) => {
                    const separator = getComputedStyle(element, '::before');
                    return [separator.width, separator.height];
                }),
        ).toEqual(['1px', '28px']);
        if (!mobile(page)) {
            const sidebar =
                value === 'light' ? 'rgb(32, 80, 61)' : 'rgb(16, 34, 25)';
            await expect(page.locator('.sidebar')).toHaveCSS(
                'background-color',
                sidebar,
            );
            await expect(page.locator('.sidebar-heading')).toHaveCSS(
                'background-color',
                sidebar,
            );
            expect(
                await page.locator('.sidebar').evaluate((element) => {
                    const separator = getComputedStyle(element, '::before');
                    return [separator.height, separator.left, separator.right];
                }),
            ).toEqual(['1px', '28px', '28px']);
        } else {
            const background =
                value === 'light' ? 'rgb(255, 255, 255)' : 'rgb(16, 34, 25)';
            for (const selector of ['.topbar', '.sidebar-heading', '.bottom-nav'])
                await expect(page.locator(selector)).toHaveCSS(
                    'background-color',
                    background,
                );
        }
        if (wide) {
            const amber =
                value === 'light' ? 'rgb(228, 176, 82)' : 'rgb(243, 213, 147)';
            await expect(card.locator('.availability-in-use')).toHaveCSS(
                'background-color',
                amber,
            );
            await expect(
                card.locator('.availability-legend li:nth-child(2) i'),
            ).toHaveCSS('background-color', amber);
        }
        await expect(
            page.getByLabel('Resumo de chaves').locator('.stat-number'),
        ).toHaveText(['7', '5', '2']);
        await audit(page);
        await page.screenshot({
            path: testInfo.outputPath(`v21-${value}.png`),
            fullPage: false,
            animations: 'disabled',
        });
    }
    if (!mobile(page)) {
        await page
            .getByRole('button', { name: 'Recolher barra lateral' })
            .focus();
        await page.keyboard.press('Enter');
        await expect(
            page.getByRole('button', { name: 'Expandir barra lateral' }),
        ).toBeVisible();
        await expect(page.getByRole('link', { name: brandName })).toBeVisible();
        expect(
            await page.locator('.sidebar').evaluate((element) => {
                const separator = getComputedStyle(element, '::before');
                return Number.parseFloat(separator.width);
            }),
        ).toBeGreaterThan(0);
        await navigate(page, 'keys');
        await page.getByRole('link', { name: brandName }).click();
        await expect(
            page.getByRole('heading', { name: 'Visão geral', exact: true }),
        ).toBeVisible();
        await page.screenshot({
            path: testInfo.outputPath('v21-compact-dark.png'),
            animations: 'disabled',
        });
    }
    await page.reload();
    await expect(page.getByLabel('Resumo de chaves')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.getByRole('button', { name: 'Ativar tema claro' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await devOption(page, 'Perfil demonstrativo', 'admin');
    await expect(page.getByLabel('Resumo de chaves')).toBeVisible();
    for (const view of ['keys', 'movements', 'team', 'settings'] as const)
        await navigate(page, view);
    if (!mobile(page)) {
        const footer = page.getByRole('navigation', {
            name: 'Navegação administrativa',
        });
        await expect(
            footer.getByRole('button', { name: 'Configurações' }),
        ).toBeVisible();
        await expect(
            page
                .getByRole('navigation', { name: 'Navegação principal' })
                .getByRole('button', { name: 'Configurações' }),
        ).toHaveCount(0);
        const side = await page.locator('.sidebar').boundingBox();
        const foot = await footer.boundingBox();
        expect(foot!.y).toBeGreaterThan(side!.y + side!.height / 2);
    }
    await page.getByRole('link', { name: brandName }).click();
    await expect(
        page.getByRole('heading', { name: 'Visão geral', exact: true }),
    ).toBeVisible();
    for (const slogan of [
        'Espaços que conectam',
        'Há espaço para criar',
        'Cada chave, uma possibilidade.',
        'A arte ocupa.',
    ])
        await expect(page.getByText(slogan, { exact: false })).toHaveCount(0);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(
        await page
            .locator('.theme-toggle .icon')
            .evaluate((element) => getComputedStyle(element).animationName),
    ).toBe('none');
    if (wide) {
        const favicon = await page.context().newPage();
        await favicon.setViewportSize({ width: 160, height: 80 });
        const source = new URL(asset!, page.url()).href;
        await favicon.setContent(
            `<html><body style="margin:0;display:flex;align-items:center;justify-content:center;gap:24px;height:80px;background:white"><img alt="16 px" src="${source}" width="16" height="16"><img alt="32 px" src="${source}" width="32" height="32"></body></html>`,
        );
        await favicon.evaluate(() =>
            Promise.all(Array.from(document.images, (image) => image.decode())),
        );
        await favicon.screenshot({
            path: testInfo.outputPath('favicon-sizes.png'),
        });
        await favicon.close();
    }
});

test('contraste em páginas, formulários, calendário, confirmações e estados', async ({
    page,
}, testInfo) => {
    test.setTimeout(120_000);
    await page.goto('/');
    await devOption(page, 'Perfil demonstrativo', 'admin');
    await expect(page.getByLabel('Resumo de chaves')).toBeVisible();
    for (const value of ['light', 'dark'] as const) {
        await theme(page, value);
        for (const view of ['movements', 'team', 'settings', 'keys'] as const) {
            await navigate(page, view);
            await audit(page);
            if (view === 'settings') {
                const save = page.getByRole('button', {
                    name: 'Salvar regras globais',
                    exact: true,
                });
                const people = await page
                    .getByRole('group', {
                        name: 'Pessoas autorizadas',
                        exact: true,
                    })
                    .boundingBox();
                const button = await save.boundingBox();
                expect(
                    button!.y - people!.y - people!.height,
                ).toBeGreaterThanOrEqual(24);
                await save.evaluate((button) =>
                    button.scrollIntoView({ block: 'center' }),
                );
                await page.screenshot({
                    path: testInfo.outputPath(`v21-settings-${value}.png`),
                    animations: 'disabled',
                });
            } else {
                await page.screenshot({
                    path: testInfo.outputPath(`handoff-${view}-${value}.png`),
                    animations: 'disabled',
                });
            }
        }
        await page
            .getByRole('button', { name: 'Retirar chave', exact: true })
            .click();
        await expect(page.getByRole('dialog')).toBeVisible();
        expect(
            await page
                .getByLabel('Devolução prevista: data')
                .evaluate((element) => getComputedStyle(element).colorScheme),
        ).toBe(value);
        await audit(page);
        await page.screenshot({
            path: testInfo.outputPath(`v21-operation-${value}.png`),
            animations: 'disabled',
        });
        await page.keyboard.press('Escape');
        await page
            .getByRole('button', { name: 'Nova chave', exact: true })
            .click();
        await page
            .getByText('Configurações avançadas', { exact: true })
            .click();
        await audit(page);
        await page.keyboard.press('Escape');
        await page
            .getByRole('button', { name: 'Ver detalhes: Auditório' })
            .click();
        await page
            .getByRole('button', { name: 'Arquivar chave', exact: true })
            .click();
        await audit(page);
        await page
            .getByRole('button', {
                name: 'Confirmar arquivamento',
                exact: true,
            })
            .click();
        await expect(page.locator('.pending-notice')).toBeVisible();
        await theme(page, value === 'light' ? 'dark' : 'light');
        await expect(page.locator('.pending-notice')).toBeVisible();
        await expect(
            page.getByRole('button', { name: 'Ver detalhes: Auditório' }),
        ).toHaveCount(0);
        await page.getByRole('button', { name: /^Desfazer/ }).click();
        await expect(
            page.getByRole('button', { name: 'Ver detalhes: Auditório' }),
        ).toBeVisible();
        await theme(page, value);
        await audit(page);
        await devOption(page, 'Cenário demonstrativo', 'error');
        await expect(
            page.getByRole('button', { name: 'Tentar novamente' }),
        ).toBeVisible();
        await audit(page);
        await devOption(page, 'Cenário demonstrativo', 'empty');
        await expect(page.getByText('Nenhuma chave encontrada')).toBeVisible();
        await audit(page);
        await devOption(page, 'Cenário demonstrativo', 'ready');
        await expect(page.getByLabel('Resumo de chaves')).toBeVisible();
    }
});
