import { describe, expect, it } from 'vitest';
import { statusText } from './gameText';

describe('statusText', () => {
  it('in progress', () => {
    expect(statusText('white', false, null)).toBe('White to move');
    expect(statusText('black', true, null)).toBe('Black to move — check!');
  });

  it('game over', () => {
    expect(
      statusText('black', true, { result: '1-0', termination: 'checkmate', winner: 'white' }),
    ).toBe('Checkmate — White wins');
    expect(
      statusText('white', false, { result: '1/2-1/2', termination: 'stalemate', winner: null }),
    ).toBe('Draw by stalemate');
    expect(
      statusText('white', false, { result: '0-1', termination: 'resign', winner: 'black' }),
    ).toBe('Black wins — White resigned');
  });
});
