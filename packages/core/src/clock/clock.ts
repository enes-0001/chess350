// Pure clock functions (SDD §6.2 and §9, ADR-009). All values are integer ms.
// `now` is ALWAYS passed in, never read from a global (invariant #2).
// Backlog: S4-01 (F16). Tests T-C1..T-C6 must use plain numbers for `now`, no timers.

import { notImplemented } from '../notImplemented';
import type { Color, TimeControl } from '../types';

export interface ClockState {
  /** Remaining time, excluding the currently running period. */
  whiteMs: number;
  blackMs: number;
  running: Color | null;
  /** Timestamp (ms) when `running` started; null when stopped. */
  turnStartedAt: number | null;
}

/** Both sides get `initialMs`. Nothing runs yet: clocks start after ply 2 (A8). */
export function createClock(tc: TimeControl): ClockState {
  return { whiteMs: tc.initialMs, blackMs: tc.initialMs, running: null, turnStartedAt: null };
}

export function remaining(_c: ClockState, _color: Color, _now: number): number {
  return notImplemented('S4-01 remaining', 'SDD §9');
}

export function startFor(_c: ClockState, _color: Color, _now: number): ClockState {
  return notImplemented('S4-01 startFor', 'SDD §9 rule 2');
}

/** Deduct elapsed, add increment (only if not flagged), switch side (SDD §9 rule 3). */
export function onMove(_c: ClockState, _mover: Color, _now: number, _tc: TimeControl): ClockState {
  return notImplemented('S4-01 onMove', 'SDD §9 rule 3');
}

/** Returns the running colour if its remaining time is ≤ −graceMs, else null (SDD §9 rule 4). */
export function flagged(_c: ClockState, _now: number, _graceMs: number): Color | null {
  return notImplemented('S4-01 flagged', 'SDD §9 rule 4');
}

/** Freezes remaining times and sets running = null (SDD §9 rule 5). */
export function stop(_c: ClockState, _now: number): ClockState {
  return notImplemented('S4-01 stop', 'SDD §9 rule 5');
}
