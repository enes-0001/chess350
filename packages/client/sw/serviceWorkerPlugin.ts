// Vite plugin: emits dist/sw.js with the exact list of built files to precache (ADR-013).
// Hand-written instead of vite-plugin-pwa: ~30 lines, no dependency, easy to read and debug.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

export function serviceWorker(): Plugin {
  return {
    name: 'chess350-service-worker',
    apply: 'build',
    generateBundle(_options, bundle) {
      const files = Object.keys(bundle)
        .filter((f) => !f.endsWith('.map') && f !== 'index.html')
        .sort();
      const precache = ['/', ...files.map((f) => `/${f}`)];
      const version = createHash('sha256').update(precache.join('\n')).digest('hex').slice(0, 12);
      const template = readFileSync(path.join(import.meta.dirname, 'sw.template.js'), 'utf8');
      const source = template
        .replaceAll('__VERSION__', version)
        .replaceAll('__PRECACHE__', JSON.stringify(precache, null, 2));
      if (/__[A-Z]+__/.test(source)) this.error('sw.template.js has an unfilled placeholder');
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}
