import { describe, expect, it } from 'vitest';
import { pgnDate, pgnResult, pgnTimeControl } from './pgn';

describe('pgn helpers (F24)', () => {
  it('formats time control per the PGN spec', () => {
    expect(pgnTimeControl({ initialMs: 300_000, incrementMs: 3000 })).toBe('300+3');
    expect(pgnTimeControl(null)).toBe('-');
  });

  it('formats the date in UTC', () => {
    expect(pgnDate(Date.UTC(2026, 10, 9, 23, 59))).toBe('2026.11.09');
  });

  it('maps outcome to PGN result', () => {
    expect(pgnResult(null)).toBe('*');
    expect(pgnResult({ result: '1-0', termination: 'checkmate', winner: 'white' })).toBe('1-0');
    expect(pgnResult({ result: null, termination: 'abort', winner: null })).toBe('*');
  });

  it.todo('S4-05: ChessGame.toPgn output parses with a PGN parser');
});
