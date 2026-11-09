// Human-readable game status (SDD §8.6: clear end-of-game messages).
import type { Color, Outcome } from '@chess350/core';

const name = (c: Color) => (c === 'white' ? 'White' : 'Black');
const other = (c: Color): Color => (c === 'white' ? 'black' : 'white');

export function statusText(turn: Color, inCheck: boolean, outcome: Outcome | null): string {
  if (!outcome) return `${name(turn)} to move${inCheck ? ' — check!' : ''}`;
  const w = outcome.winner;
  switch (outcome.termination) {
    case 'checkmate':
      return `Checkmate — ${name(w!)} wins`;
    case 'stalemate':
      return 'Draw by stalemate';
    case 'threefold':
      return 'Draw by threefold repetition';
    case 'fifty-move':
      return 'Draw by the 50-move rule';
    case 'insufficient-material':
      return 'Draw — insufficient material';
    case 'agreement':
      return 'Draw by agreement';
    case 'resign':
      return `${name(w!)} wins — ${name(other(w!))} resigned`;
    case 'timeout':
      return `${name(w!)} wins on time`;
    case 'timeout-vs-insufficient':
      return `Draw — ${name(turn)} ran out of time, but ${name(other(turn))} cannot mate`;
    case 'abandon':
      return `${name(w!)} wins — opponent left the game`;
    case 'abort':
      return 'Game aborted';
  }
}
