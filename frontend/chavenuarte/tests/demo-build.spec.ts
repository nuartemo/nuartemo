import { expect, test } from '@playwright/test';
test('artefato demonstrativo local preserva isolamento, marca e tema', async ({
    page,
}) => {
    const external: string[] = [];
    page.on('request', (request) => {
        if (
            /^https?:/.test(request.url()) &&
            !request.url().startsWith('http://127.0.0.1:4175/')
        )
            external.push(request.url());
    });
    await page.goto('/');
    await expect(page.getByLabel('Resumo de chaves')).toBeVisible();
    await expect(
        page.getByLabel('Ferramentas de desenvolvimento'),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Ativar tema escuro' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page
        .getByRole('navigation', { name: 'Navegação principal' })
        .getByRole('button', { name: 'Chaves e espaços', exact: true })
        .click();
    await page.getByRole('link', { name: 'ChaveNUARTE — Visão geral' }).click();
    await expect(
        page.getByRole('heading', { name: 'Visão geral', exact: true }),
    ).toBeVisible();
    expect(external).toEqual([]);
});
