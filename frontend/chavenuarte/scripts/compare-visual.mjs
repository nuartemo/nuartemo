import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { chromium } from '@playwright/test';
const require = createRequire(import.meta.url);
// PNG decoder bundled with the pinned Playwright version; no extra dependency.
const { PNG } = require(resolve(dirname(require.resolve('playwright-core/package.json')), 'lib/utilsBundle.js'));
// Ignore at most 2/255 per channel of rasterization noise; record every raw difference.
const channelTolerance = 2;
const baseline = process.argv[2];
assert(baseline, 'Informe o diretório do build demo original aprovado como argumento.');
const current = fileURLToPath(new URL('../dist-demo/', import.meta.url));
const output = fileURLToPath(new URL('../visual-comparison/', import.meta.url));
await mkdir(output, { recursive: true });
async function serve(directory, port) {
    const root = resolve(directory);
    await readFile(resolve(root, 'index.html'));
    const server = createServer(async (request, response) => {
        try {
            const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
            const file = resolve(root, `.${path === '/' ? '/index.html' : path}`);
            if (!file.startsWith(root + sep)) { response.writeHead(403); response.end(); return; }
            const bytes = await readFile(file);
            response.setHeader('Content-Type', ({ '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' })[extname(file)] ?? 'application/octet-stream');
            response.end(bytes);
        } catch { response.writeHead(404); response.end(); }
    });
    await new Promise((done, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', done); });
    return server;
}
async function navigate(page, view) {
    const small = page.viewportSize().width < 768;
    const names = { overview: 'Visão geral', keys: 'Chaves e espaços', movements: 'Movimentações', team: 'Equipe', settings: 'Configurações' };
    if (small && ['team', 'settings'].includes(view)) {
        await page.getByRole('navigation', { name: 'Navegação inferior' }).getByRole('button', { name: 'Gestão', exact: true }).click();
        await page.locator('.management-links').getByRole('button', { name: new RegExp(`^${names[view]}`) }).click();
    } else {
        const name = small ? { overview: 'Início', keys: 'Chaves', movements: 'Histórico' }[view] : names[view];
        await page.getByRole('navigation', { name: small ? 'Navegação inferior' : view === 'settings' ? 'Navegação administrativa' : 'Navegação principal' }).getByRole('button', { name, exact: true }).click();
    }
}
const servers = [];
let browser;
const results = [];
try {
    servers.push(await serve(baseline, 4180), await serve(current, 4181));
    browser = await chromium.launch({ executablePath: process.env.CHAVENUARTE_CHROME_PATH ?? '/usr/bin/google-chrome', args: ['--disable-gpu'] });
    for (const width of [1440, 1024, 497, 390, 320]) {
        const contexts = await Promise.all([4180, 4181].map(() => browser.newContext({ viewport: { width, height: 1050 }, timezoneId: 'America/Fortaleza', reducedMotion: 'reduce' })));
        const pages = await Promise.all(contexts.map((context) => context.newPage()));
        try {
            for (let index = 0; index < pages.length; index++) {
                const page = pages[index];
                await page.clock.install({ time: new Date('2026-11-14T13:00:00Z') });
                await page.goto(`http://127.0.0.1:${4180 + index}/`);
                await page.getByLabel('Resumo de chaves').waitFor();
                await page.getByLabel('Ferramentas de desenvolvimento').click();
                await page.getByLabel('Perfil demonstrativo', { exact: true }).selectOption('admin');
                await page.getByLabel('Ferramentas de desenvolvimento').click();
                await page.getByLabel('Resumo de chaves').waitFor();
                await page.evaluate(() => document.fonts.ready);
            }
            for (const theme of ['light', 'dark']) {
                if (theme === 'dark') for (const page of pages) await page.getByRole('button', { name: 'Ativar tema escuro' }).click();
                for (const view of ['overview', 'movements', 'team', 'settings', 'keys', 'withdrawal']) {
                    for (const page of pages) {
                        if (view === 'withdrawal') await page.getByRole('button', { name: 'Retirar chave', exact: true }).click();
                        else await navigate(page, view);
                        await page.evaluate(() => window.scrollTo(0, 0));
                        await page.mouse.move(0, 0);
                    }
                    const images = [];
                    for (let index = 0; index < pages.length; index++) images.push(await pages[index].screenshot({ path: `${output}/${width}-${theme}-${view}-${index === 0 ? 'before' : 'after'}.png`, animations: 'disabled', fullPage: true }));
                    const [before, after] = images.map((buffer) => PNG.sync.read(buffer));
                    let differentPixels = 0, rawDifferentPixels = 0, maxChannelDelta = 0;
                    if (before.width !== after.width || before.height !== after.height) differentPixels = Infinity;
                    else for (let pixel = 0; pixel < before.data.length; pixel += 4) {
                        const delta = Math.max(...[0, 1, 2, 3].map((offset) => Math.abs(before.data[pixel + offset] - after.data[pixel + offset])));
                        if (delta > 0) rawDifferentPixels++;
                        if (delta > channelTolerance) differentPixels++;
                        maxChannelDelta = Math.max(maxChannelDelta, delta);
                    }
                    results.push({ width, theme, view, differentPixels, rawDifferentPixels, maxChannelDelta });
                    console.log(`${width}px ${theme} ${view}: ${differentPixels} pixels acima da tolerância; ${rawDifferentPixels} diferenças brutas, delta máximo ${maxChannelDelta}/255`);
                    if (view === 'withdrawal') for (const page of pages) await page.keyboard.press('Escape');
                }
            }
        } finally { await Promise.all(contexts.map((context) => context.close())); }
    }
    await writeFile(`${output}/report.json`, JSON.stringify({ baseline: resolve(baseline), current, channelTolerance, comparisons: results }, null, 2));
    assert(results.every((result) => result.differentPixels === 0), 'Regressão visual detectada; consulte visual-comparison/.');
    console.log(`${results.length} comparações aprovadas, zero diferenças acima de ${channelTolerance}/255 por canal.`);
} finally {
    await browser?.close();
    await Promise.all(servers.map((server) => new Promise((done) => server.close(done))));
}
