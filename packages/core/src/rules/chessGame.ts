// Rules engine: thin wrapper around chess.js (SDD §6.1, ADR-002).
// Turns chess.js exceptions into typed results and adds what chess.js lacks
// (strict promotion rule, canMate for timeout-vs-insufficient, our Outcome type).

import { Chess, type Square } from 'chess.js';
import { pgnResult, type PgnHeaders } from '../pgn/pgn';
import { UCI_PATTERN, type Color, type MoveRecord, type Outcome, type Uci } from '../types';

export type MoveResult = { ok: true; move: MoveRecord } | { ok: false; error: 'ILLEGAL_MOVE' };

const toColor = (c: 'w' | 'b'): Color => (c === 'w' ? 'white' : 'black');

const uciOf = (m: { from: string; to: string; promotion?: string }): Uci =>
  `${m.from}${m.to}${m.promotion ?? ''}`;

/**
 * A game is fully determined by its start position and UCI move list (SDD §6.1 "Determinism").
 * Normal games start from the standard position; `fromFen` exists for tests and future tools.
 */
export class ChessGame {
  private readonly chess: Chess;
  private readonly records: MoveRecord[] = [];
  private readonly startFen: string | null;

  constructor(movesUci: readonly Uci[] = [], startFen?: string) {
    this.startFen = startFen ?? null;
    this.chess = startFen ? new Chess(startFen) : new Chess();
    for (const uci of movesUci) {
      const r = this.tryMove(uci);
      if (!r.ok) throw new Error(`Invalid move list at "${uci}"`);
    }
  }

  static fromFen(fen: string, movesUci: readonly Uci[] = []): ChessGame {
    return new ChessGame(movesUci, fen);
  }

  get turn(): Color {
    return toColor(this.chess.turn());
  }

  /** Number of half-moves played since the start position. */
  get ply(): number {
    return this.records.length;
  }

  get fen(): string {
    return this.chess.fen();
  }

  get history(): readonly MoveRecord[] {
    return this.records;
  }

  get movesUci(): Uci[] {
    return this.records.map((r) => r.uci);
  }

  inCheck(): boolean {
    return this.chess.inCheck();
  }

  /** Legal moves from a square as UCI (promotions appear once per piece, e.g. b7b8q, b7b8n). */
  legalMovesFrom(square: string): Uci[] {
    return this.chess.moves({ square: square as Square, verbose: true }).map(uciOf);
  }

  /** True when moving from → to is legal only with a promotion letter (UI shows the picker). */
  needsPromotion(from: string, to: string): boolean {
    return this.legalMovesFrom(from).some((u) => u.startsWith(from + to) && u.length === 5);
  }

  /** A pawn move to the last rank WITHOUT a promotion letter is ILLEGAL_MOVE (SDD §6.1). */
  tryMove(uci: Uci): MoveResult {
    if (!UCI_PATTERN.test(uci)) return { ok: false, error: 'ILLEGAL_MOVE' };
    const from = uci.slice(0, 2);
    const legal = this.chess
      .moves({ square: from as Square, verbose: true })
      .find((m) => uciOf(m) === uci);
    if (!legal) return { ok: false, error: 'ILLEGAL_MOVE' };

    const played = this.chess.move({ from: legal.from, to: legal.to, promotion: legal.promotion });
    const record: MoveRecord = {
      ply: this.records.length + 1,
      uci,
      san: played.san,
      fenAfter: this.chess.fen(),
    };
    this.records.push(record);
    return { ok: true, move: record };
  }

  /**
   * Game end by the rules alone. Draws are automatic (A4). Checkmate is checked first,
   * so a mate on the 100th half-move still counts as mate (FIDE 9.6).
   */
  outcomeByRules(): Outcome | null {
    const c = this.chess;
    if (c.isCheckmate()) {
      const winner: Color = this.turn === 'white' ? 'black' : 'white';
      return { result: winner === 'white' ? '1-0' : '0-1', termination: 'checkmate', winner };
    }
    const draw = (termination: Outcome['termination']): Outcome => ({
      result: '1/2-1/2',
      termination,
      winner: null,
    });
    if (c.isStalemate()) return draw('stalemate');
    if (c.isInsufficientMaterial()) return draw('insufficient-material');
    if (c.isThreefoldRepetition()) return draw('threefold');
    if (c.isDrawByFiftyMoves()) return draw('fifty-move');
    return null;
  }

  /**
   * Can `color` still deliver mate by some sequence of legal moves? Conservative approximation
   * of FIDE 6.9 (A5): false only with a bare king, or king + exactly one knight or bishop.
   */
  canMate(color: Color): boolean {
    const side = color === 'white' ? 'w' : 'b';
    let minors = 0;
    for (const row of this.chess.board()) {
      for (const sq of row) {
        if (!sq || sq.color !== side || sq.type === 'k') continue;
        if (sq.type === 'p' || sq.type === 'r' || sq.type === 'q') return true;
        minors++;
      }
    }
    return minors >= 2;
  }

  /** Local mode only (F13). Returns the undone move, or null at the start position. */
  undo(): MoveRecord | null {
    if (this.records.length === 0) return null;
    this.chess.undo();
    return this.records.pop() ?? null;
  }

  /** PGN export (F24). Result defaults to the rules outcome, or "*" while in progress. */
  toPgn(headers: Partial<PgnHeaders> = {}): string {
    const pgn = this.startFen ? new Chess(this.startFen) : new Chess();
    for (const r of this.records) {
      pgn.move({ from: r.uci.slice(0, 2), to: r.uci.slice(2, 4), promotion: r.uci[4] });
    }
    // Seven Tag Roster order first (PGN spec 8.1.1), then the optional tags.
    const tags: Record<string, string> = {
      Event: '?',
      Site: '?',
      Date: '????.??.??',
      Round: '-',
      White: '?',
      Black: '?',
      Result: pgnResult(this.outcomeByRules()),
    };
    for (const [k, v] of Object.entries(headers)) if (v !== undefined) tags[k] = v;
    if (this.startFen) {
      tags.SetUp = '1';
      tags.FEN = this.startFen;
    }
    for (const [k, v] of Object.entries(tags)) pgn.setHeader(k, v);
    return pgn.pgn();
  }
}
