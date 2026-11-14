import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const manifest = JSON.parse(
    await readFile(`${dist}/.vite/manifest.json`, 'utf8'),
);
assert(
    manifest['index.html']?.isEntry,
    'Manifesto deve conter o ponto de entrada isolado.',
);
assert(
    Object.keys(manifest).some((key) => key.includes('ProductionApp')),
    'Entrada segura de produção ausente.',
);
assert(
    !Object.keys(manifest).some((key) => key.includes('/dev/')),
    'Módulo demonstrativo encontrado no manifesto.',
);
const assets = await readdir(`${dist}/assets`);
assert(
    !assets.some((name) => name.endsWith('.map')),
    'Source maps não são permitidos neste build.',
);
const scripts = await Promise.all(
    assets
        .filter((name) => name.endsWith('.js'))
        .map((name) => readFile(`${dist}/assets/${name}`, 'utf8')),
);
const code = scripts.join('\n');
// Production may persist only a validated visual theme. Profile overrides and
// the demonstration module graph remain forbidden below and in the Vite plugin.
for (const marker of [
    'Perfil demonstrativo',
    'Cenário demonstrativo',
    'Reiniciar demonstração',
    'Bolsista exemplo',
    'Atendimento demonstrativo',
    'createDemoService',
    'registerMovement',
    'sessionStorage',
    'painel-chaves',
    'suap',
    'DEMO-00',
    'Ferramentas de desenvolvimento',
    'stageAdmin',
    'undoPending',
    'supervisor',
    'bolsista',
    'chavenuarte.sidebar.compact',
]) {
    assert(!code.includes(marker), `Conteúdo proibido em produção: ${marker}`);
}
assert(
    code.includes('Aguardando integração institucional'),
    'Estado seguro de produção ausente.',
);
const html = await readFile(`${dist}/index.html`, 'utf8');
assert(
    code.includes('chavenuarte.theme'),
    'Preferência visual de tema ausente.',
);
assert(html.includes('chavenuarte-key.svg'), 'Favicon da V2 ausente.');
await readFile(`${dist}/chavenuarte-key.svg`, 'utf8');
assert(!html.includes('/src/'), 'HTML ainda referencia fontes.');
assert(html.includes('./assets/'), 'Os caminhos do build devem ser relativos.');
console.log(
    `Build verificado: ${assets.length} assets, manifesto isolado, sem seletor, fixtures ou operações demonstrativas.`,
);
