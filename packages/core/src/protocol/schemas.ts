// zod schemas for every client → server payload (SDD §11.3).
// The server MUST parse every inbound payload with these (invariant #5).

import { z } from 'zod';
import { CHAT_MAX_LEN, CODE_ALPHABET, CODE_LENGTH, CUSTOM_LIMITS } from '../config';
import { UCI_PATTERN } from '../types';

const MINUTE = 60_000;
const SECOND = 1000;

/** Normalises user input ("k7x2qp " → "K7X2QP"). Use before validating a code. */
export const normalizeCode = (raw: string): string => raw.trim().toUpperCase();

export const codeSchema = z
  .string()
  .length(CODE_LENGTH)
  .refine((s) => [...s].every((ch) => CODE_ALPHABET.includes(ch)), 'invalid code characters');

export const timeControlSchema = z.object({
  initialMs: z
    .number()
    .int()
    .min(CUSTOM_LIMITS.minMinutes * MINUTE)
    .max(CUSTOM_LIMITS.maxMinutes * MINUTE),
  incrementMs: z
    .number()
    .int()
    .min(CUSTOM_LIMITS.minIncrementSeconds * SECOND)
    .max(CUSTOM_LIMITS.maxIncrementSeconds * SECOND),
});

export const roomCreateSchema = z.object({
  color: z.enum(['white', 'black', 'random']),
  timeControl: timeControlSchema.nullable(),
});

export const roomJoinSchema = z.object({
  code: codeSchema,
  token: z.string().min(1).max(100).optional(),
});

export const emptySchema = z.object({}).strict();

export const gameMoveSchema = z.object({
  uci: z.string().regex(UCI_PATTERN),
  ply: z.number().int().min(0),
});

export const gameDrawSchema = z.object({
  action: z.enum(['offer', 'accept', 'decline']),
});

export const gameTakebackSchema = z.object({
  action: z.enum(['request', 'accept', 'decline']),
});

export const chatSendSchema = z.object({
  text: z.string().trim().min(1).max(CHAT_MAX_LEN),
});

export type RoomCreatePayload = z.infer<typeof roomCreateSchema>;
export type RoomJoinPayload = z.infer<typeof roomJoinSchema>;
export type GameMovePayload = z.infer<typeof gameMoveSchema>;
export type GameDrawPayload = z.infer<typeof gameDrawSchema>;
export type GameTakebackPayload = z.infer<typeof gameTakebackSchema>;
export type ChatSendPayload = z.infer<typeof chatSendSchema>;
