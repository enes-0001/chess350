import { CODE_ALPHABET, codeSchema } from '@chess350/core';
import { describe, expect, it } from 'vitest';
import { hashToken, newCode, newToken, tokenMatches } from './ids';

describe('ids (SDD §12)', () => {
  it('newCode produces valid codes', () => {
    for (let i = 0; i < 200; i++) {
      expect(codeSchema.safeParse(newCode(() => false)).success).toBe(true);
    }
  });

  it('newCode retries while a code is taken (live room or tombstone)', () => {
    let calls = 0;
    // Deterministic "random": first code is all index 0, then all index 1.
    const rand = () => Math.floor(calls++ / 6);
    const taken = CODE_ALPHABET[0]!.repeat(6);
    expect(newCode((c) => c === taken, rand)).toBe(CODE_ALPHABET[1]!.repeat(6));
  });

  it('newCode gives up instead of looping forever', () => {
    expect(() => newCode(() => true)).toThrow(/free room code/);
  });

  it('tokens are long, unique and only verifiable through their hash', () => {
    const a = newToken();
    const b = newToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThanOrEqual(43); // 32 bytes base64url
    const stored = hashToken(a);
    expect(stored).not.toContain(a);
    expect(tokenMatches(a, stored)).toBe(true);
    expect(tokenMatches(b, stored)).toBe(false);
  });
});
