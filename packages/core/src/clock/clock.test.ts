// Test catalogue for the clock (SDD §9, §16.2). Backlog task S4-01.
// Use plain numbers for `now` — no fake timers needed because the functions are pure.
import { describe, expect, it } from 'vitest';
import { createClock } from './clock';

describe('clock (F16)', () => {
  it('createClock gives both sides the initial time and runs nothing', () => {
    const c = createClock({ initialMs: 300_000, incrementMs: 3000 });
    expect(c).toEqual({ whiteMs: 300_000, blackMs: 300_000, running: null, turnStartedAt: null });
  });

  it.todo('T-C1: clock does not run before ply 2');
  it.todo('T-C2: elapsed time is deducted, increment added');
  it.todo('T-C3: no increment after a flag');
  it.todo('T-C4: flagged() respects CLOCK_GRACE_MS');
  it.todo('T-C5: timeout vs insufficient material gives a draw');
  it.todo('T-C6: stop() freezes remaining times');
});
