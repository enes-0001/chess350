import { describe, expect, it } from 'vitest';
import {
  chatSendSchema,
  codeSchema,
  gameMoveSchema,
  normalizeCode,
  roomCreateSchema,
  roomJoinSchema,
} from './schemas';

describe('protocol schemas (SDD §11.3)', () => {
  it('normalizes and validates invite codes', () => {
    expect(normalizeCode('  k7x2qp ')).toBe('K7X2QP');
    expect(codeSchema.safeParse('K7X2QP').success).toBe(true);
    expect(codeSchema.safeParse('K7X2Q').success).toBe(false); // too short
    expect(codeSchema.safeParse('K7X2Q0').success).toBe(false); // 0 is not in the alphabet
  });

  it('room:create accepts colour + time control or untimed', () => {
    expect(
      roomCreateSchema.safeParse({
        color: 'random',
        timeControl: { initialMs: 300_000, incrementMs: 3000 },
      }).success,
    ).toBe(true);
    expect(roomCreateSchema.safeParse({ color: 'white', timeControl: null }).success).toBe(true);
    expect(roomCreateSchema.safeParse({ color: 'green', timeControl: null }).success).toBe(false);
    expect(
      roomCreateSchema.safeParse({
        color: 'white',
        timeControl: { initialMs: 1, incrementMs: 0 },
      }).success,
    ).toBe(false);
  });

  it('room:join token is optional', () => {
    expect(roomJoinSchema.safeParse({ code: 'K7X2QP' }).success).toBe(true);
    expect(roomJoinSchema.safeParse({ code: 'K7X2QP', token: 'abc' }).success).toBe(true);
  });

  it('game:move requires UCI and a non-negative integer ply', () => {
    expect(gameMoveSchema.safeParse({ uci: 'e2e4', ply: 0 }).success).toBe(true);
    expect(gameMoveSchema.safeParse({ uci: 'e7e8q', ply: 12 }).success).toBe(true);
    expect(gameMoveSchema.safeParse({ uci: 'e2e9', ply: 0 }).success).toBe(false);
    expect(gameMoveSchema.safeParse({ uci: 'Nf3', ply: 0 }).success).toBe(false);
    expect(gameMoveSchema.safeParse({ uci: 'e2e4', ply: -1 }).success).toBe(false);
    expect(gameMoveSchema.safeParse({ uci: 'e2e4', ply: 1.5 }).success).toBe(false);
  });

  it('chat:send trims and limits length', () => {
    expect(chatSendSchema.safeParse({ text: '   ' }).success).toBe(false);
    expect(chatSendSchema.safeParse({ text: 'x'.repeat(201) }).success).toBe(false);
    expect(chatSendSchema.parse({ text: '  gg  ' }).text).toBe('gg');
  });
});
