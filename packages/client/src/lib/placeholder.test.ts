// Client unit tests live next to the code (e.g. src/local/localController.test.ts in S2-03).
// This file keeps `vitest run` meaningful until the first real client module exists.
import { codeSchema, normalizeCode } from '@chess350/core';
import { describe, expect, it } from 'vitest';

describe('client can import @chess350/core', () => {
  it('normalizes a typed code the way the Home screen does', () => {
    expect(codeSchema.safeParse(normalizeCode(' k7x2qp ')).success).toBe(true);
  });
});
