// The command pipeline (SDD §7.3): parse (zod) → [rate-limit] → handler → ack.
// Handlers are SYNCHRONOUS on purpose: returning Ack (not Promise<Ack>) makes invariant #4
// (no await between reading and mutating room state) a compile-time guarantee.
import { fail, type Ack } from '@chess350/core';
import type { Socket } from 'socket.io';
import type { z } from 'zod';
import type { Logger } from '../infra/logger';

export function onCommand<S extends z.ZodType, R>(
  socket: Socket,
  event: string,
  schema: S,
  logger: Logger,
  handler: (payload: z.infer<S>) => Ack<R>,
): void {
  socket.on(event, (payload: unknown, ack: unknown) => {
    const reply = typeof ack === 'function' ? (ack as (a: Ack<R>) => void) : () => undefined;

    const parsed = schema.safeParse(payload ?? {});
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      reply(fail('BAD_REQUEST', issue ? `${issue.path.join('.')}: ${issue.message}` : 'invalid'));
      return;
    }

    try {
      reply(handler(parsed.data));
    } catch (err) {
      logger.error({ err, event }, 'command failed');
      reply(fail('INTERNAL', 'Unexpected server error'));
    }
  });
}
