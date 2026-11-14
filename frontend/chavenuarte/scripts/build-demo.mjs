import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
process.env.NODE_ENV = 'production';
const { build } = await import('vite');
await build({ mode: 'demo', build: { outDir: 'dist-demo' } });
const manifest = JSON.parse(
    await readFile(
        new URL('../dist-demo/.vite/manifest.json', import.meta.url),
        'utf8',
    ),
);
assert(
    Object.keys(manifest).some((key) => key.includes('src/dev/DevelopmentApp')),
    'Entrada demonstrativa ausente.',
);
assert(
    !Object.keys(manifest).some((key) => key.includes('ProductionApp')),
    'As duas saídas devem permanecer separadas.',
);
console.log(
    'Build demonstrativo local concluído em dist-demo/. Não substitui dist/ nem o painel institucional.',
);
