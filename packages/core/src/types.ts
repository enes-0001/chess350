// Domain types shared by server and client. See SDD §6.1–§6.2.

export type Color = 'white' | 'black';

export const otherColor = (c: Color): Color => (c === 'white' ? 'black' : 'white');

/** Move in UCI format: from + to [+ promotion], e.g. "e2e4", "e7e8q". Wire format for moves. */
export type Uci = string;

export const UCI_PATTERN = /^[a-h][1-8][a-h][1-8][qrbn]?$/;

export interface MoveRecord {
  /** 1-based ply index of this move (white's first move is ply 1). */
  ply: number;
  uci: Uci;
  san: string;
  fenAfter: string;
}

export type Termination =
  | 'checkmate'
  | 'stalemate'
  | 'threefold'
  | 'fifty-move'
  | 'insufficient-material'
  | 'resign'
  | 'agreement'
  | 'timeout'
  | 'timeout-vs-insufficient'
  | 'abandon'
  | 'abort';

export type Result = '1-0' | '0-1' | '1/2-1/2';

export interface Outcome {
  /** null only for aborted games. */
  result: Result | null;
  termination: Termination;
  winner: Color | null;
}

/** Clock settings. A game without a clock uses `timeControl: null`. */
export interface TimeControl {
  initialMs: number;
  incrementMs: number;
}
