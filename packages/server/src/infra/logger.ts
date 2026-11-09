// Structured JSON logs (SDD §7.8). Never log tokens, IPs or chat text.
import { pino, type Logger } from 'pino';

export type { Logger };

export function createLogger(level: string): Logger {
  return pino({ level, base: { app: 'chess350' } });
}
