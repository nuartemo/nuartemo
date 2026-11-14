import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('produção permanece bloqueada e não inclui controles ou serviços de demonstração', async ({
    page,
}) => {
    const errors: string[] = [];
    const requests: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => requests.push(request.url()));
    await page.addInitScript(() => {
        localStorage.setItem('role', 'supervisor');
        sessionStorage.setItem('role', 'admin');
        Object.assign(window, { role: 'supervisor', __DEV__: true });
    });
    await page.goto('/?role=supervisor&dev=true#admin');
    await expect(
        page.getByRole('heading', {
            name: 'Aguardando integração institucional',
        }),
    ).toBeVisible();
    await expect(page.getByRole('combobox')).toHaveCount(0);
    await expect(page.getByRole('button')).toHaveCount(1);
    await page.getByRole('button', { name: 'Ativar tema escuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(
        page.getByRole('heading', {
            name: 'Aguardando integração institucional',
        }),
    ).toBeVisible();
    await expect(page.getByRole('navigation')).toHaveCount(0);
    expect(
        (
            await new AxeBuilder({ page })
                .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
                .analyze()
        ).violations,
    ).toEqual([]);
    expect(
        requests
            .filter((url) => /^https?:/.test(url))
            .every((url) => url.startsWith('http://127.0.0.1:4174/')),
    ).toBe(true);
    expect(
        requests.some((url) =>
            /\/api\/|suap|DevelopmentApp|demo-service|fixtures/.test(url),
        ),
    ).toBe(false);
    await page.setViewportSize({ width: 320, height: 740 });
    expect(
        await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
    ).toBe(true);
    expect(errors).toEqual([]);
});
