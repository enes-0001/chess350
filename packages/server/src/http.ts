// HTTP side: security headers, /healthz, built client + SPA fallback (SDD §5.3, §7.1).
import express, { type Express } from 'express';
import { existsSync } from 'node:fs';
import path from 'node:path';

export interface HttpDeps {
  clientDist: string | null;
  health: () => Record<string, unknown>;
}

export function createHttpApp({ clientDist, health }: HttpDeps): Express {
  const app = express();
  app.disable('x-powered-by');

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Frame-Options', 'DENY');
    // S5-05: tighten with a full Content-Security-Policy once the client's needs are known.
    next();
  });

  app.get('/healthz', (_req, res) => {
    res.json({ ok: true, ...health() });
  });

  if (clientDist && existsSync(clientDist)) {
    app.use(express.static(clientDist, { index: false, maxAge: '1y', immutable: true }));
    const indexHtml = path.join(clientDist, 'index.html');
    // SPA fallback: any other GET that wants HTML gets index.html (routes like /g/K7X2QP).
    app.use((req, res, next) => {
      if (req.method !== 'GET' || !req.accepts('html')) return next();
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(indexHtml);
    });
  }

  return app;
}
