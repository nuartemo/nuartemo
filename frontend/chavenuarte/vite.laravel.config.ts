import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vite';
import panelConfig from './vite.config';

export default defineConfig(async (environment) => {
    if (environment.mode !== 'laravel' || environment.command !== 'build')
        throw new Error('Use npm run build:laravel para gerar o artefato institucional.');
    return mergeConfig(
        await (typeof panelConfig === 'function' ? panelConfig(environment) : panelConfig),
        {
            publicDir: false,
            build: {
                outDir: fileURLToPath(new URL('../../public/chavenuarte-v2/', import.meta.url)),
                manifest: 'manifest.json',
                rollupOptions: {
                    input: fileURLToPath(new URL('./src/laravel.tsx', import.meta.url)),
                },
            },
        },
    );
});
