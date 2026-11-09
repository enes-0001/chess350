// Invite codes and seat tokens (SDD §7.4, §12; invariant #8).
import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { CODE_ALPHABET, CODE_LENGTH } from '@chess350/core';

type RandomInt = (maxExclusive: number) => number;

/**
 * Random 6-char code from a CSPRNG. Retries while `isTaken(code)` is true
 * (live rooms AND tombstones, so expired codes are never reused).
 */
export function newCode(isTaken: (code: string) => boolean, rand: RandomInt = randomInt): string {
  for (let attempt = 0; attempt < 100; attempt++) {
    let code = '';
    for (let i = 0; i < CODE_LENGTH; i++) code += CODE_ALPHABET[rand(CODE_ALPHABET.length)];
    if (!isTaken(code)) return code;
  }
  throw new Error('Could not find a free room code after 100 attempts');
}

/** 256-bit secret. Give it to the client once; store only its hash. */
export function newToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Constant-time comparison of a presented token against a stored hash. */
export function tokenMatches(token: string, storedHash: string): boolean {
  const a = Buffer.from(hashToken(token), 'hex');
  const b = Buffer.from(storedHash, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}
