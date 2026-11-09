// Rules engine: thin wrapper around chess.js (SDD §6.1, ADR-002).
// Backlog: S2-01 (F1–F3). Replace every notImplemented() with real code + tests T-R1..T-R10.

import { notImplemented } from '../notImplemented';
import type { Color, MoveRecord, Outcome, Uci } from '../types';
import type { PgnHeaders } from '../pgn/pgn';

export type MoveResult = { ok: true; move: MoveRecord } | { ok: false; error: 'ILLEGAL_MOVE' };

/**
 * A game is fully determined by its UCI move list (SDD §6.1 "Determinism").
 * chess.js throws on illegal moves; this wrapper turns that into a typed result.
 */
export class ChessGame {
  // Implementation hint: keep a private `Chess` instance from 'chess.js'
  // and a MoveRecord[] history; replay `movesUci` in the constructor.

  constructor(movesUci: readonly Uci[] = []) {
    void movesUci;
  }

  get turn(): Color {
    return notImplemented('S2-01 ChessGame.turn', 'SDD §6.1');
  }

  get ply(): number {
    return notImplemented('S2-01 ChessGame.ply', 'SDD §6.1');
  }

  get fen(): string {
    return notImplemented('S2-01 ChessGame.fen', 'SDD §6.1');
  }

  get history(): readonly MoveRecord[] {
    return notImplemented('S2-01 ChessGame.history', 'SDD §6.1');
  }

  inCheck(): boolean {
    return notImplemented('S2-01 ChessGame.inCheck', 'SDD §6.1');
  }

  /** Legal destination moves from a square, for UI highlights (F2). */
  legalMovesFrom(_square: string): Uci[] {
    return notImplemented('S2-01 ChessGame.legalMovesFrom', 'SDD §6.1');
  }

  /** A pawn move to the last rank WITHOUT a promotion letter is ILLEGAL_MOVE. */
  tryMove(_uci: Uci): MoveResult {
    return notImplemented('S2-01 ChessGame.tryMove', 'SDD §6.1');
  }

  /** Mate, stalemate, threefold, 50-move, insufficient material — automatic (A4). */
  outcomeByRules(): Outcome | null {
    return notImplemented('S2-02 ChessGame.outcomeByRules', 'SDD §6.1, A4');
  }

  /** false when `color` has only K, or K + one minor piece (A5, FIDE 6.9 approximation). */
  canMate(_color: Color): boolean {
    return notImplemented('S2-02 ChessGame.canMate', 'SDD §6.1, A5');
  }

  /** Local mode only (F13). */
  undo(): MoveRecord | null {
    return notImplemented('S2-04 ChessGame.undo', 'SDD §8.5');
  }

  toPgn(_headers: PgnHeaders): string {
    return notImplemented('S4-05 ChessGame.toPgn', 'SDD §14');
  }
}
