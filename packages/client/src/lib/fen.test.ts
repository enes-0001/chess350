import { ChessGame } from '@chess350/core';
import { describe, expect, it } from 'vitest';
import { kingSquare, materialFromFen } from './fen';

describe('fen helpers', () => {
  it('finds both kings', () => {
    const fen = new ChessGame().fen;
    expect(kingSquare(fen, 'white')).toBe('e1');
    expect(kingSquare(fen, 'black')).toBe('e8');
    expect(kingSquare('8/8/8/8/8/8/8/8 w - - 0 1', 'white')).toBeNull();
  });

  it('start position has no captures and equal material', () => {
    expect(materialFromFen(new ChessGame().fen)).toEqual({
      capturedBy: { white: '', black: '' },
      diff: 0,
    });
  });

  it('tracks captures and balance', () => {
    const g = new ChessGame(['e2e4', 'd7d5', 'e4d5', 'd8d5']);
    expect(materialFromFen(g.fen)).toEqual({ capturedBy: { white: '♟', black: '♙' }, diff: 0 });
    const g2 = new ChessGame(['e2e4', 'd7d5', 'e4d5']);
    expect(materialFromFen(g2.fen)).toMatchObject({ capturedBy: { white: '♟' }, diff: 1 });
  });
});
