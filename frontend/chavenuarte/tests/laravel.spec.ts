import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

async function navigate(page: Page, view: 'overview' | 'keys' | 'movements' | 'team' | 'settings') {
    const labels = { overview: 'Visão geral', keys: 'Chaves e espaços', movements: 'Movimentações', team: 'Equipe', settings: 'Configurações' };
    const mobile = page.viewportSize()!.width < 768;
    if (mobile && ['team', 'settings'].includes(view)) {
        await page.getByRole('navigation', { name: 'Navegação inferior' }).getByRole('button', { name: 'Gestão', exact: true }).click();
        await page.locator('.management-links').getByRole('button', { name: new RegExp(`^${labels[view]}`) }).click();
    } else {
        const label = mobile ? { overview: 'Início', keys: 'Chaves', movements: 'Histórico', team: '', settings: '' }[view] : labels[view];
        await page.getByRole('navigation', { name: mobile ? 'Navegação inferior' : view === 'settings' ? 'Navegação administrativa' : 'Navegação principal' }).getByRole('button', { name: label, exact: true }).click();
    }
    await expect(page.getByRole('heading', { name: labels[view], level: 1 })).toBeVisible();
}

for (const path of ['/painel-chaves', '/painel-chaves/', '/nuarte/painel-chaves', '/nuarte/painel-chaves/']) {
    test(`entrada Blade/PHP e assets independentes da URL: ${path}`, async ({ page }) => {
        const errors: string[] = [];
        const requests: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('request', (request) => requests.push(request.url()));
        page.on('response', (response) => { if (response.status() >= 400) errors.push(`${response.status()}: ${response.url()}`); });
        await page.addInitScript(() => {
            localStorage.setItem('role', 'supervisor');
            sessionStorage.setItem('role', 'admin');
            Object.assign(window, { role: 'supervisor', __DEV__: true });
        });
        await page.goto(`${path}?role=supervisor&dev=true#admin`);
        await expect(page.getByRole('heading', { name: 'Visão geral', level: 1 })).toBeVisible();
        await expect(page.getByRole('combobox')).toHaveCount(0);
        await expect(page.getByRole('navigation', { name: 'Navegação principal' })).toBeVisible();
        await expect(page.getByText('Cargo não informado', { exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Retirar chave', exact: true })).toBeDisabled();
        await expect(page.getByLabel('Resumo de chaves').locator('.stat-number')).toHaveText(['—', '—', '—']);
        await expect(page.getByText('Aguardando integração institucional')).toHaveCount(0);
        expect(await page.locator('meta[name="csrf-token"]').getAttribute('content')).toBeTruthy();
        const prefix = path.startsWith('/nuarte/') ? '/nuarte' : '';
        await expect(page.getByRole('link', { name: 'ChaveNUARTE — Visão geral' })).toHaveAttribute('href', `${prefix}/painel-chaves`);
        const symbol = await page.locator('.brand use').getAttribute('href');
        expect(symbol).toContain(`${prefix}/chavenuarte-v2/assets/chavenuarte-key-`);
        const icon = await page.request.get(symbol!.split('#')[0]);
        expect(icon.ok()).toBe(true);
        expect(await icon.text()).toContain('id="chavenuarte-key"');
        expect(requests.filter((url) => /https?:/.test(url)).every((url) => url.startsWith('http://127.0.0.1:4176/'))).toBe(true);
        expect(requests.some((url) => /\/api\/|suap|DevelopmentApp|demo-service|fixtures|chavenuarte-assets|\/build\//.test(url))).toBe(false);
        expect(errors).toEqual([]);
    });
}
for (const width of [1440, 1024, 497, 390, 320]) {
    test(`institucional em ${width}px nos dois temas`, async ({ page }, info) => {
        test.setTimeout(120000);
        await page.setViewportSize({ width, height: 900 });
        await page.goto('/nuarte/painel-chaves');
        await expect(page.getByRole('heading', { name: 'Visão geral', level: 1 })).toBeVisible();
        for (const theme of ['light', 'dark']) {
            if (theme === 'dark') await page.getByRole('button', { name: 'Ativar tema escuro' }).click();
            await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
            for (const view of ['overview', 'keys', 'movements', 'team', 'settings'] as const) {
                await navigate(page, view);
                expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
                expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
                for (const button of await page.locator('main button.button').all()) await expect(button).toBeDisabled();
                await expect(page.getByRole('combobox')).toHaveCount(0);
                // Axe may move focus/scroll while checking skip links. Capture the page from the top.
                await page.evaluate(() => {
                    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
                    window.scrollTo(0, 0);
                });
                await page.screenshot({ path: info.outputPath(`laravel-${width}-${theme}-${view}.png`), animations: 'disabled', fullPage: true });
            }
        }
        await page.reload();
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    });
}
test('manifesto ausente mantém recuperação sem executar JS do painel', async ({ page }) => {
    await page.goto('/nuarte/painel-chaves?assets=missing');
    await expect(page.getByRole('heading', { name: 'Interface temporariamente indisponível' })).toBeVisible();
    await expect(page.locator('script[type="module"]')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Recarregar painel' })).toHaveAttribute('href', '/nuarte/painel-chaves');
});
for (const extension of ['js', 'css']) {
    test(`falha de rede no ${extension} apresenta recuperação`, async ({ page }) => {
        await page.route(new RegExp(`/chavenuarte-v2/assets/laravel-[^/]+\\.${extension}$`), (route) => route.abort());
        await page.goto('/painel-chaves');
        await expect(page.getByRole('heading', { name: 'Interface temporariamente indisponível' })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Recarregar painel' })).toBeVisible();
    });
}
test('JavaScript desativado recebe orientação explícita', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4176/painel-chaves');
    await expect(page.locator('noscript p')).toBeVisible();
    await expect(page.locator('noscript p')).toHaveText('Ative o JavaScript para abrir o ChaveNUARTE.');
    await context.close();
});
test('stylesheet do painel não afeta HTML institucional sem o namespace', async ({ page }) => {
    await page.goto('/painel-chaves');
    const css = await page.locator('link[rel="stylesheet"]').getAttribute('href');
    await page.setContent('<html><head></head><body><h1>Institucional</h1><button class="button">Exemplo</button></body></html>');
    const before = await page.locator('body').evaluate((element) => {
        const css = getComputedStyle(element); return [css.margin, css.fontFamily, css.backgroundColor, css.color];
    });
    await page.addStyleTag({ url: css! });
    expect(await page.locator('body').evaluate((element) => {
        const css = getComputedStyle(element); return [css.margin, css.fontFamily, css.backgroundColor, css.color];
    })).toEqual(before);
});

test('identificação entregue pela view não se converte em cargo ou permissão de operação', async ({ page }) => {
    // Only the isolated presentation fixture simulates this session value.
    await page.goto('/painel-chaves?session=provided');
    await expect(page.getByRole('heading', { name: 'Visão geral', level: 1 })).toBeVisible();
    await expect(page.getByText('Identificação SUAP', { exact: true })).toBeVisible();
    await expect(page.getByText('server-session-test', { exact: true })).toBeVisible();
    await expect(page.getByText(/Nome, vínculo e cargo não informados/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retirar chave', exact: true })).toBeDisabled();
    await navigate(page, 'team');
    await expect(page.getByRole('button', { name: 'Gerenciar pessoas' })).toBeDisabled();
    await expect(page.getByRole('combobox')).toHaveCount(0);
});
