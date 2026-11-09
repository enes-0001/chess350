// Shared constants. Single source for every timeout and limit (SDD §6.4).
// Change a value here, not inline, and update SDD §6.4 in the same PR.

import type { TimeControl } from './types';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

// ---- invite codes (SRS 5.2) ----
export const CODE_LENGTH = 6;
/** 31 symbols, without the look-alikes 0/O, 1/I/L. */
export const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

// ---- lifecycle timers (SDD §7.5) ----
export const FIRST_MOVE_TIMEOUT_MS = 30 * SECOND; // A8
export const RECONNECT_GRACE_MS = 60 * SECOND; // A7
export const CLOCK_GRACE_MS = 300; // §9 rule 8
export const FINISHED_ROOM_TTL_MS = 30 * MINUTE; // F23
export const INACTIVE_ROOM_TTL_MS = 24 * HOUR; // SRS 5.3
export const TOMBSTONE_TTL_MS = 24 * HOUR; // §7.5 sweep

// ---- limits ----
export const MAX_SPECTATORS = 50; // A6
export const CHAT_MAX_LEN = 200;
export const CHAT_HISTORY = 100;

// ---- time controls (F16) ----
export interface TimePreset {
  id: string;
  label: string;
  category: 'blitz' | 'rapid' | 'classical';
  timeControl: TimeControl;
}

const tc = (minutes: number, incSeconds: number): TimeControl => ({
  initialMs: minutes * MINUTE,
  incrementMs: incSeconds * SECOND,
});

export const TIME_PRESETS: readonly TimePreset[] = [
  { id: '3+2', label: '3+2', category: 'blitz', timeControl: tc(3, 2) },
  { id: '5+3', label: '5+3', category: 'blitz', timeControl: tc(5, 3) },
  { id: '10+5', label: '10+5', category: 'rapid', timeControl: tc(10, 5) },
  { id: '15+10', label: '15+10', category: 'rapid', timeControl: tc(15, 10) },
  { id: '30+20', label: '30+20', category: 'classical', timeControl: tc(30, 20) },
];

export const CUSTOM_LIMITS = {
  minMinutes: 1,
  maxMinutes: 180,
  minIncrementSeconds: 0,
  maxIncrementSeconds: 60,
} as const;
