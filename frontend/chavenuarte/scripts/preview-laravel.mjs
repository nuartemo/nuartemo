// Presentation fixture only; never serves as an application/authentication server.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
const exec = promisify(execFile);
const artifact = fileURLToPath(new URL('../../../public/chavenuarte-v2/', import.meta.url));
const renderer = fileURLToPath(new URL('./verify-blade.php', import.meta.url));
createServer(async (request, response) => {
    try {
        const url = new URL(request.url, 'http://127.0.0.1:4176');
        const prefix = url.pathname.startsWith('/nuarte/') ? '/nuarte' : '';
        const path = url.pathname.slice(prefix.length);
        if (path === '/painel-chaves' || path === '/painel-chaves/') {
            const { stdout } = await exec('php', [renderer, '--html'], {
                env: { ...process.env, CHAVENUARTE_TEST_PREFIX: prefix,
                    CHAVENUARTE_TEST_IDENTIFIER: url.searchParams.get('session') === 'provided' ? 'server-session-test' : '',
                    CHAVENUARTE_TEST_MISSING: url.searchParams.get('assets') === 'missing' ? '1' : '' },
            });
            response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); response.end(stdout); return;
        }
        if (/^\/chavenuarte-v2\/assets\/[A-Za-z0-9_.-]+\.(js|css|svg)$/.test(path)) {
            const file = path.replace('/chavenuarte-v2/', '');
            const content = await readFile(`${artifact}/${file}`);
            response.writeHead(200, { 'Content-Type': file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'image/svg+xml' }); response.end(content); return;
        }
        response.writeHead(404); response.end('Not found');
    } catch { response.writeHead(500); response.end('Presentation fixture failed.'); }
}).listen(4176, '127.0.0.1', () => console.log('Prévia de apresentação Blade/PHP em http://127.0.0.1:4176/painel-chaves — helpers simulados, sem SUAP/backend.'));
