// Local (offline) game state (SDD §8.5; backlog S2-03, S2-04, S2-06).
// A pure reducer over the UCI move list: all rules come from core's ChessGame.
import { ChessGame, type Uci } from '@chess350/core';

export interface LocalState {
  moves: Uci[];
  /** Moves undone most recently first; cleared by any new move. */
  redo: Uci[];
  /** Ply being reviewed, or null when showing the live position. */
  viewPly: number | null;
}

export type LocalAction =
  | { type: 'move'; uci: Uci }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'reset' }
  | { type: 'view'; ply: number | null };

export const initialLocalState: LocalState = { moves: [], redo: [], viewPly: null };

export function localReducer(state: LocalState, action: LocalAction): LocalState {
  switch (action.type) {
    case 'move': {
      if (state.viewPly !== null) return state; // reviewing: board is read-only
      const game = new ChessGame(state.moves);
      if (game.outcomeByRules()) return state;
      if (!game.tryMove(action.uci).ok) return state;
      return { moves: [...state.moves, action.uci], redo: [], viewPly: null };
    }
    case 'undo': {
      const last = state.moves.at(-1);
      if (last === undefined) return state;
      return { moves: state.moves.slice(0, -1), redo: [last, ...state.redo], viewPly: null };
    }
    case 'redo': {
      const [next, ...rest] = state.redo;
      if (next === undefined) return state;
      return { moves: [...state.moves, next], redo: rest, viewPly: null };
    }
    case 'reset':
      return initialLocalState;
    case 'view': {
      if (action.ply === null) return { ...state, viewPly: null };
      const ply = Math.max(0, Math.min(action.ply, state.moves.length));
      return { ...state, viewPly: ply === state.moves.length ? null : ply };
    }
  }
}

// ---- persistence: a refresh must not lose the game (per-device convenience only) ----

const STORAGE_KEY = '350chess:local-game';

export function loadLocalState(): LocalState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialLocalState;
    const parsed = JSON.parse(raw) as { moves?: unknown; redo?: unknown };
    const moves = Array.isArray(parsed.moves) ? parsed.moves.map(String) : [];
    const redo = Array.isArray(parsed.redo) ? parsed.redo.map(String) : [];
    new ChessGame([...moves, ...redo]); // throws if the stored data is not a valid game
    return { moves, redo, viewPly: null };
  } catch {
    return initialLocalState;
  }
}

export function saveLocalState(state: LocalState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ moves: state.moves, redo: state.redo }));
  } catch {
    // Storage unavailable (private mode, quota): the game still works, it just won't survive a reload.
  }
}
