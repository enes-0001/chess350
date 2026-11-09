// Rules engine tests (SDD §16.2, T-R1..T-R10).
import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { ChessGame } from './chessGame';

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const play = (moves: string) => new ChessGame(moves.split(' ').filter(Boolean));

describe('ChessGame basics', () => {
  it('starts from the standard position with white to move', () => {
    const g = new ChessGame();
    expect(g.fen).toBe(START);
    expect(g.turn).toBe('white');
    expect(g.ply).toBe(0);
    expect(g.inCheck()).toBe(false);
    expect(g.outcomeByRules()).toBeNull();
  });

  it('applies a legal move and records UCI, SAN, ply and FEN', () => {
    const g = new ChessGame();
    const r = g.tryMove('g1f3');
    expect(r).toMatchObject({ ok: true, move: { ply: 1, uci: 'g1f3', san: 'Nf3' } });
    expect(g.turn).toBe('black');
    expect(g.history[0]?.fenAfter).toBe(g.fen);
  });

  it('rejects illegal and malformed moves without changing state', () => {
    const g = new ChessGame();
    for (const bad of ['e2e5', 'e7e5', 'z9z9', '', 'e2e4x', 'Nf3']) {
      expect(g.tryMove(bad)).toEqual({ ok: false, error: 'ILLEGAL_MOVE' });
    }
    expect(g.ply).toBe(0);
    expect(g.fen).toBe(START);
  });

  it('constructor throws on an invalid move list', () => {
    expect(() => new ChessGame(['e2e4', 'e2e4'])).toThrow(/Invalid move list/);
  });

  it('legalMovesFrom lists UCI moves for a square (F2)', () => {
    expect(new ChessGame().legalMovesFrom('g1').sort()).toEqual(['g1f3', 'g1h3']);
    expect(new ChessGame().legalMovesFrom('e4')).toEqual([]);
  });

  it('undo reverts exactly one move (F13)', () => {
    const g = play('e2e4 e7e5');
    expect(g.undo()?.uci).toBe('e7e5');
    expect(g.ply).toBe(1);
    expect(g.turn).toBe('black');
    expect(new ChessGame().undo()).toBeNull();
  });
});

describe('T-R1: castling', () => {
  it('both sides, as O-O and O-O-O', () => {
    const g = play('e2e4 e7e5 g1f3 b8c6 f1c4 d7d6 e1g1');
    expect(g.history.at(-1)?.san).toBe('O-O');
    const q = play('d2d4 d7d5 b1c3 b8c6 c1f4 c8f5 d1d2 d8d7 e1c1 e8c8');
    expect(q.history.map((m) => m.san).slice(-2)).toEqual(['O-O-O', 'O-O-O']);
  });

  it('not through an attacked square, not out of check, not after the king moved', () => {
    // f1 attacked by a black bishop on c4: kingside castling is illegal.
    expect(ChessGame.fromFen('4k3/8/8/8/2b5/8/8/4K2R w K - 0 1').tryMove('e1g1').ok).toBe(false);
    // King in check from e8 rook.
    expect(ChessGame.fromFen('4r1k1/8/8/8/8/8/8/4K2R w K - 0 1').tryMove('e1g1').ok).toBe(false);
    // King moved and came back: rights are gone.
    const g = play('e2e4 e7e5 g1f3 b8c6 f1c4 g8f6 e1e2 f8c5 e2e1 d7d6');
    expect(g.tryMove('e1g1').ok).toBe(false);
  });
});

describe('T-R2: en passant', () => {
  it('allowed immediately after the double step', () => {
    const g = play('e2e4 a7a6 e4e5 d7d5');
    expect(g.tryMove('e5d6')).toMatchObject({ ok: true, move: { san: 'exd6' } });
  });

  it('not allowed one move later', () => {
    const g = play('e2e4 a7a6 e4e5 d7d5 a2a3 h7h6');
    expect(g.tryMove('e5d6').ok).toBe(false);
  });
});

describe('T-R3: promotion', () => {
  const fen = '8/1P6/8/8/8/8/k7/4K3 w - - 0 1';

  it('requires a promotion letter', () => {
    const g = ChessGame.fromFen(fen);
    expect(g.needsPromotion('b7', 'b8')).toBe(true);
    expect(g.tryMove('b7b8').ok).toBe(false);
  });

  it.each([
    ['q', 'b8=Q'],
    ['r', 'b8=R'],
    ['b', 'b8=B'],
    ['n', 'b8=N'],
  ])('promotes to %s', (p, san) => {
    const g = ChessGame.fromFen(fen);
    expect(g.tryMove(`b7b8${p}`)).toMatchObject({
      ok: true,
      move: { san: expect.stringContaining(san) },
    });
  });

  it('rejects a promotion letter on a normal move', () => {
    expect(new ChessGame().tryMove('e2e4q').ok).toBe(false);
  });
});

describe('T-R4: checkmate', () => {
  it("fool's mate: black wins", () => {
    expect(play('f2f3 e7e5 g2g4 d8h4').outcomeByRules()).toEqual({
      result: '0-1',
      termination: 'checkmate',
      winner: 'black',
    });
  });

  it('back-rank mate: white wins', () => {
    const g = ChessGame.fromFen('6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1');
    g.tryMove('a1a8');
    expect(g.outcomeByRules()).toMatchObject({ result: '1-0', winner: 'white' });
  });
});

describe('T-R5: stalemate', () => {
  it('is a draw', () => {
    const g = ChessGame.fromFen('k7/8/2Q5/8/8/8/8/7K w - - 0 1');
    g.tryMove('c6c7');
    expect(g.inCheck()).toBe(false);
    expect(g.outcomeByRules()).toEqual({
      result: '1/2-1/2',
      termination: 'stalemate',
      winner: null,
    });
  });
});

describe('T-R6: threefold repetition', () => {
  it('ends the game automatically (A4)', () => {
    const shuffle = 'g1f3 g8f6 f3g1 f6g8';
    expect(play(shuffle).outcomeByRules()).toBeNull(); // start position seen twice
    expect(play(`${shuffle} ${shuffle}`).outcomeByRules()).toMatchObject({
      termination: 'threefold',
      result: '1/2-1/2',
    });
  });
});

describe('T-R7: 50-move rule', () => {
  it('a quiet move at halfmove clock 99 draws', () => {
    const g = ChessGame.fromFen('4k3/8/8/8/8/8/8/R3K3 w - - 99 60');
    expect(g.outcomeByRules()).toBeNull();
    g.tryMove('a1a2');
    expect(g.outcomeByRules()).toMatchObject({ termination: 'fifty-move', result: '1/2-1/2' });
  });

  it('checkmate on the 100th half-move still counts as mate', () => {
    const g = ChessGame.fromFen('6k1/5ppp/8/8/8/8/8/R5K1 w - - 99 60');
    g.tryMove('a1a8');
    expect(g.outcomeByRules()?.termination).toBe('checkmate');
  });
});

describe('T-R8: insufficient material', () => {
  it.each([
    ['K vs K', '4k3/8/8/8/8/8/8/4K3 w - - 0 1'],
    ['KB vs K', '4k3/8/8/8/8/8/8/2B1K3 w - - 0 1'],
    ['KN vs K', '4k3/8/8/8/8/8/8/1N2K3 w - - 0 1'],
    ['KB vs KB, same colour bishops', '4kb2/8/8/8/8/8/8/2B1K3 w - - 0 1'],
  ])('%s is a draw', (_name, fen) => {
    expect(ChessGame.fromFen(fen).outcomeByRules()?.termination).toBe('insufficient-material');
  });

  it('KR vs K is not', () => {
    expect(ChessGame.fromFen('4k3/8/8/8/8/8/8/R3K3 w - - 0 1').outcomeByRules()).toBeNull();
  });
});

describe('T-R9: canMate (A5)', () => {
  it.each([
    ['bare king', '4k3/8/8/8/8/8/8/4K3 w - - 0 1', false],
    ['king + bishop', '4k3/8/8/8/8/8/8/2B1K3 w - - 0 1', false],
    ['king + knight', '4k3/8/8/8/8/8/8/1N2K3 w - - 0 1', false],
    ['king + two knights', '4k3/8/8/8/8/8/8/1N2KN2 w - - 0 1', true],
    ['king + bishop + knight', '4k3/8/8/8/8/8/8/1NB1K3 w - - 0 1', true],
    ['king + pawn', '4k3/8/8/8/8/8/4P3/4K3 w - - 0 1', true],
    ['king + rook', '4k3/8/8/8/8/8/8/R3K3 w - - 0 1', true],
    ['king + queen', '4k3/8/8/8/8/8/8/3QK3 w - - 0 1', true],
  ])('white with %s → %s', (_name, fen, expected) => {
    expect(ChessGame.fromFen(fen).canMate('white')).toBe(expected);
  });

  it('looks only at the requested colour', () => {
    const g = ChessGame.fromFen('3qk3/8/8/8/8/8/8/4K3 w - - 0 1');
    expect(g.canMate('white')).toBe(false);
    expect(g.canMate('black')).toBe(true);
  });
});

describe('T-R10: determinism', () => {
  it('replaying the UCI list reproduces the FEN and SAN', () => {
    const g = play('e2e4 c7c5 g1f3 d7d6 d2d4 c5d4 f3d4 g8f6 b1c3 a7a6');
    const replayed = new ChessGame(g.movesUci);
    expect(replayed.fen).toBe(g.fen);
    expect(replayed.history.map((m) => m.san)).toEqual(g.history.map((m) => m.san));
  });
});

describe('toPgn (F24)', () => {
  it('produces a PGN that a parser reads back to the same position', () => {
    const g = play('e2e4 e7e5 f1c4 b8c6 d1h5 g8f6 h5f7');
    const pgn = g.toPgn({ Event: '350 Chess test', White: 'A', Black: 'B', Date: '2026.11.09' });
    expect(pgn).toContain('[Event "350 Chess test"]');
    expect(pgn).toContain('[Result "1-0"]');
    expect(pgn).toMatch(/4\. Qxf7# 1-0$/);
    const parsed = new Chess();
    parsed.loadPgn(pgn);
    expect(parsed.fen()).toBe(g.fen);
  });

  it('uses "*" for an unfinished game and starts with the Seven Tag Roster', () => {
    const pgn = play('d2d4').toPgn();
    expect(pgn.split('\n')[0]).toBe('[Event "?"]');
    expect(pgn).toContain('[Result "*"]');
  });
});
