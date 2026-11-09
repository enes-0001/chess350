// Error codes returned in acks (SDD §11.6).

export const ERROR_CODES = [
  'BAD_REQUEST',
  'RATE_LIMITED',
  'ROOM_NOT_FOUND',
  'ROOM_EXPIRED',
  'ROOM_FULL',
  'NOT_A_PLAYER',
  'NOT_YOUR_TURN',
  'STALE_PLY',
  'ILLEGAL_MOVE',
  'GAME_OVER',
  'NOT_ALLOWED',
  'INTERNAL',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export interface ProtocolError {
  code: ErrorCode;
  message: string;
}

/** Shape of every ack. Commands without return data use `Ack<undefined>`. */
export type Ack<T = undefined> = { ok: true; data: T } | { ok: false; error: ProtocolError };

export const ok = <T>(data: T): Ack<T> => ({ ok: true, data });
export const fail = (code: ErrorCode, message: string): Ack<never> => ({
  ok: false,
  error: { code, message },
});
