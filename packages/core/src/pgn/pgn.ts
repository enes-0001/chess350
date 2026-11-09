// PGN export helpers (SDD §14, F24). Backlog: S4-05.

import type { Outcome, TimeControl } from '../types';

export interface PgnHeaders {
  Event: string;
  Site: string;
  Date: string; // YYYY.MM.DD
  White: string;
  Black: string;
  Result: '1-0' | '0-1' | '1/2-1/2' | '*';
  TimeControl: string; // "300+3" or "-"
  Termination?: string;
}

/** "300+3" for 5+3, "-" for untimed (PGN spec). */
export function pgnTimeControl(tc: TimeControl | null): string {
  if (tc === null) return '-';
  return `${Math.round(tc.initialMs / 1000)}+${Math.round(tc.incrementMs / 1000)}`;
}

/** PGN date from a timestamp. The caller passes `at` (core is pure). */
export function pgnDate(at: number): string {
  const d = new Date(at);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}.${pad(d.getUTCMonth() + 1)}.${pad(d.getUTCDate())}`;
}

export function pgnResult(outcome: Outcome | null): PgnHeaders['Result'] {
  return outcome?.result ?? '*';
}
