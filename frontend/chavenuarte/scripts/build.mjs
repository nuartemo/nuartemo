// Set before importing Vite so the inherited shell environment cannot select
// React's development runtime or the development module graph for this build.
process.env.NODE_ENV = 'production';
const { build } = await import('vite');
await build({ mode: 'production' });
await import('./verify-build.mjs');
