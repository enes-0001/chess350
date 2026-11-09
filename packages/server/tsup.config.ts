import { defineConfig } from 'tsup';

// Bundles the server into dist/index.js. @chess350/core is TypeScript source,
// so it must be bundled in; real npm dependencies stay external.
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node24',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  noExternal: ['@chess350/core'],
});
