// Server configuration from environment variables (SDD §5.3).
import path from 'node:path';

export interface ServerConfig {
  port: number;
  /** Browser origins allowed to open a socket (CSWSH protection, SDD §11.1). */
  allowedOrigins: string[];
  logLevel: string;
  /** Built client to serve as static files; null = do not serve (dev uses Vite). */
  clientDist: string | null;
}

const DEV_ORIGINS = ['http://localhost:5173', 'http://localhost:3000'];

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const port = Number(env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 0) throw new Error(`Invalid PORT: ${env.PORT}`);

  const allowedOrigins = env.ALLOWED_ORIGINS
    ? env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : DEV_ORIGINS;

  // dist/index.js and src/index.ts are both two levels below packages/, so this works for both.
  const defaultDist = path.resolve(import.meta.dirname, '../../client/dist');

  return {
    port,
    allowedOrigins,
    logLevel: env.LOG_LEVEL ?? 'info',
    clientDist: env.CLIENT_DIST === 'none' ? null : (env.CLIENT_DIST ?? defaultDist),
  };
}
