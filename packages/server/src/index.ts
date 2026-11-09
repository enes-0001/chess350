// Entry point: `npm run dev` (tsx watch) or `node dist/index.js` (production).
import { createApp } from './app';
import { loadConfig } from './config';
import { createLogger } from './infra/logger';

const config = loadConfig();
const logger = createLogger(config.logLevel);
const app = createApp({ config, logger });

const port = await app.listen();
logger.info({ port, allowedOrigins: config.allowedOrigins }, '350 Chess server listening');

const shutdown = (signal: string) => {
  logger.info({ signal }, 'shutting down');
  // S4: emit room:closed {reason: 'server-restart'} to connected clients first (SDD §7.9).
  void app.close().then(() => process.exit(0));
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
