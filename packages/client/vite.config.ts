import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { serviceWorker } from './build/serviceWorkerPlugin.ts';

// Dev: Vite serves the app on :5173 and proxies the realtime API to the server on :3000,
// so the browser sees a single origin, exactly like production (SDD §5.3).
export default defineConfig({
  plugins: [react(), serviceWorker()],
  server: {
    port: 5173,
    proxy: {
      '/socket.io': { target: 'http://localhost:3000', ws: true },
      '/healthz': 'http://localhost:3000',
    },
  },
  build: {
    sourcemap: true,
  },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
