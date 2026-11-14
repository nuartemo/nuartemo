import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// This project never loads Laravel environment files or writes into public/.
export default defineConfig(({ command, mode }) => ({
    root: fileURLToPath(new URL('.', import.meta.url)),
    envDir: false,
    base: './',
    define:
        command === 'build'
            ? {
                  'import.meta.env.DEV': mode === 'demo' ? 'true' : 'false',
                  'import.meta.env.PROD': mode === 'demo' ? 'false' : 'true',
              }
            : {},
    plugins: [
        react(),
        {
            name: 'exclude-development-modules',
            apply: 'build',
            generateBundle(_options, bundle) {
                if (mode === 'demo') return; // Explicit, isolated local demonstration artifact.
                for (const output of Object.values(bundle)) {
                    if (output.type !== 'chunk') continue;
                    for (const moduleId of Object.keys(output.modules)) {
                        if (
                            moduleId.replaceAll('\\', '/').includes('/src/dev/')
                        ) {
                            this.error(
                                'O build não pode incluir módulos demonstrativos de desenvolvimento.',
                            );
                        }
                    }
                }
            },
        },
    ],
    server: {
        port: 5174,
        strictPort: true,
        fs: {
            strict: true,
            allow: [fileURLToPath(new URL('.', import.meta.url))],
        },
    },
    preview: { port: 4174, strictPort: true },
    build: {
        outDir: mode === 'demo' ? 'dist-demo' : 'dist',
        emptyOutDir: true,
        manifest: true,
        sourcemap: false,
    },
}));
