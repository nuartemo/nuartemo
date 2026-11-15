process.env.NODE_ENV = 'production';
const { build } = await import('vite');
await build({ configFile: new URL('../vite.laravel.config.ts', import.meta.url).pathname, mode: 'laravel' });
await import('./verify-laravel.mjs');
