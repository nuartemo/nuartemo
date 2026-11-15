import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Separate outputs; never loads Laravel environment files or the root Vite config.
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
    css: {
        postcss: {
            plugins: [{
                postcssPlugin: 'chavenuarte-style-isolation',
                Rule(rule) {
                    if (rule.selector.includes(':where(.chavenuarte-v2)')) return;
                    if (rule.parent?.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return;
                    // :where keeps the approved cascade and specificity intact.
                    rule.selectors = rule.selectors.map((selector) =>
                        selector.startsWith(':root')
                            ? selector.replace(':root', ':root:where(.chavenuarte-v2)')
                            : `:where(.chavenuarte-v2) ${selector}`,
                    );
                },
            }],
        },
    },
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
        assetsInlineLimit: 0,
    },
}));
