// Small read-only helpers over a FEN string (UI only; rules live in @chess350/core).
import type { Color } from '@chess350/core';

const FILES = 'abcdefgh';

/** Square of `color`'s king, e.g. "e1". */
export function kingSquare(fen: string, color: Color): string | null {
  const target = color === 'white' ? 'K' : 'k';
  const rows = (fen.split(' ')[0] ?? '').split('/');
  for (let r = 0; r < rows.length; r++) {
    let file = 0;
    for (const ch of rows[r] ?? '') {
      if (/\d/.test(ch)) {
        file += Number(ch);
      } else {
        if (ch === target) return `${FILES[file]}${8 - r}`;
        file++;
      }
    }
  }
  return null;
}

const VALUE: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
const START: Record<string, number> = { q: 1, r: 2, b: 2, n: 2, p: 8 };
const ORDER = ['q', 'r', 'b', 'n', 'p'] as const;
const GLYPH = {
  white: { q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  black: { q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
} as const;

export interface Material {
  /** Pieces each side has captured, as glyphs of the captured pieces. */
  capturedBy: Record<Color, string>;
  /** Material balance in pawns: positive = white ahead. */
  diff: number;
}

/**
 * Captured pieces are derived from what is missing compared with the start position.
 * After a promotion the counts can exceed the start; those are clamped to zero.
 */
export function materialFromFen(fen: string): Material {
  const count: Record<Color, Record<string, number>> = {
    white: { q: 0, r: 0, b: 0, n: 0, p: 0 },
    black: { q: 0, r: 0, b: 0, n: 0, p: 0 },
  };
  let diff = 0;
  for (const ch of fen.split(' ')[0] ?? '') {
    const t = ch.toLowerCase();
    if (!(t in VALUE)) continue;
    const color: Color = ch === t ? 'black' : 'white';
    count[color][t]! += 1;
    diff += (color === 'white' ? 1 : -1) * VALUE[t]!;
  }
  const missing = (color: Color) =>
    ORDER.map((t) => GLYPH[color][t].repeat(Math.max(0, START[t]! - count[color][t]!))).join('');
  return { capturedBy: { white: missing('black'), black: missing('white') }, diff };
}
