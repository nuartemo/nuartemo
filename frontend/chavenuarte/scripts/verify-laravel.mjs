import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

export const artifact = fileURLToPath(new URL('../../../public/chavenuarte-v2/', import.meta.url));
export const manifest = JSON.parse(await readFile(`${artifact}/manifest.json`, 'utf8'));
assert(manifest['src/laravel.tsx']?.isEntry, 'Entrada Laravel ausente.');
assert(Object.keys(manifest).some((key) => key.includes('Dashboard')), 'Telas institucionais ausentes.');
assert(manifest['public/chavenuarte-key.svg'], 'SVG versionado ausente.');
const listed = new Set();
for (const entry of Object.values(manifest)) {
    assert(!entry.src?.includes('/dev/'), 'Módulo demo no manifesto institucional.');
    for (const file of [entry.file, ...(entry.css ?? []), ...(entry.assets ?? [])]) {
        assert(/^assets\/[A-Za-z0-9_.-]+\.(js|css|svg)$/.test(file), `Caminho inválido: ${file}`);
        await readFile(`${artifact}/${file}`);
        listed.add(file);
    }
    for (const imported of [...(entry.imports ?? []), ...(entry.dynamicImports ?? [])])
        assert(manifest[imported], `Chunk não listado: ${imported}`);
}
const files = await readdir(`${artifact}/assets`);
assert(files.every((file) => listed.has(`assets/${file}`)), 'Asset fora do manifesto.');
assert(!(await readdir(artifact)).includes('index.html'), 'Laravel não deve carregar HTML de demo.');
const code = (await Promise.all(files.filter((file) => file.endsWith('.js')).map((file) => readFile(`${artifact}/assets/${file}`, 'utf8')))).join('\n');
for (const marker of ['Perfil demonstrativo', 'Cenário demonstrativo', 'createDemoService', 'DEMO-00', 'Ferramentas de desenvolvimento', 'Reiniciar demonstração', 'Bolsista exemplo'])
    assert(!code.includes(marker), `Conteúdo demo: ${marker}`);
assert(!/https?:\/\/suap|\/api\//.test(code), 'Endpoint não observado no build.');
assert(code.includes('Dados de chaves indisponíveis'), 'Interface institucional sem dados ausente.');
assert(code.includes('Cargo não informado'), 'Identidade desconhecida deve permanecer explícita.');
for (const file of files.filter((file) => file.endsWith('.css'))) {
    const css = postcss.parse(await readFile(`${artifact}/assets/${file}`, 'utf8'));
    css.walkAtRules((rule) => {
        if (/keyframes$/i.test(rule.name)) assert(rule.params.startsWith('chavenuarte-'), 'Keyframe global.');
    });
    css.walkRules((rule) => {
        if (rule.parent.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return;
        assert(rule.selectors.every((selector) => selector.startsWith(':where(.chavenuarte-v2)') || selector.startsWith(':root:where(.chavenuarte-v2)')), `Estilo global: ${rule.selector}`);
    });
}
console.log(`Laravel: ${listed.size} assets versionados válidos, telas preservadas, CSS isolado, sem módulos demo ou endpoints inventados.`);
