import { describe, expect, it } from 'vitest';
import { CODE_ALPHABET, CODE_LENGTH, CUSTOM_LIMITS, TIME_PRESETS } from './config';

describe('config', () => {
  it('code alphabet has no look-alike characters and no duplicates', () => {
    for (const ch of '01OIL') expect(CODE_ALPHABET).not.toContain(ch);
    expect(new Set(CODE_ALPHABET).size).toBe(CODE_ALPHABET.length);
  });

  it('code space is large enough to be unguessable (SDD §12)', () => {
    expect(CODE_ALPHABET.length ** CODE_LENGTH).toBeGreaterThan(5e8);
  });

  it('every preset is inside the custom limits', () => {
    for (const p of TIME_PRESETS) {
      expect(p.timeControl.initialMs).toBeGreaterThanOrEqual(CUSTOM_LIMITS.minMinutes * 60_000);
      expect(p.timeControl.initialMs).toBeLessThanOrEqual(CUSTOM_LIMITS.maxMinutes * 60_000);
      expect(p.timeControl.incrementMs).toBeLessThanOrEqual(
        CUSTOM_LIMITS.maxIncrementSeconds * 1000,
      );
      expect(Number.isInteger(p.timeControl.initialMs)).toBe(true);
    }
  });
});
