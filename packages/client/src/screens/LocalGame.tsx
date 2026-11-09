// Local game screen (SDD §8.5): two players on one device, works offline.
// F12 local play · F13 undo/redo · F14 flip · F22 step through moves · F24 PGN export.
import { ChessGame, pgnDate, type Color } from '@chess350/core';
import { useEffect, useMemo, useReducer, useState } from 'react';
import { Board } from '../components/Board';
import { CapturedPieces } from '../components/CapturedPieces';
import { MoveList } from '../components/MoveList';
import { downloadText } from '../lib/download';
import { kingSquare, materialFromFen } from '../lib/fen';
import { statusText } from '../lib/gameText';
import { loadLocalState, localReducer, saveLocalState } from '../local/localGame';

const TERMINATION_PGN: Record<string, string> = {
  checkmate: 'Normal',
  stalemate: 'Normal',
  threefold: 'Normal',
  'fifty-move': 'Normal',
  'insufficient-material': 'Normal',
};

export function LocalGame() {
  const [state, dispatch] = useReducer(localReducer, undefined, loadLocalState);
  const [manualOrientation, setManualOrientation] = useState<Color>('white');
  const [autoFlip, setAutoFlip] = useState(false);

  const live = useMemo(() => new ChessGame(state.moves), [state.moves]);
  const shownPly = state.viewPly ?? live.ply;
  const shown = useMemo(
    () => (state.viewPly === null ? live : new ChessGame(state.moves.slice(0, state.viewPly))),
    [live, state.moves, state.viewPly],
  );
  const outcome = live.outcomeByRules();
  const reviewing = state.viewPly !== null;
  const orientation: Color = autoFlip ? live.turn : manualOrientation;
  const material = materialFromFen(shown.fen);
  const lastRecord = shown.history.at(-1);
  const status = statusText(live.turn, live.inCheck(), outcome);

  useEffect(() => saveLocalState(state), [state]);

  useEffect(() => {
    document.title = `${outcome ? 'Game over' : status} · 350 Chess`;
  }, [outcome, status]);

  // ← / → step through moves (SDD §14).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'ArrowLeft') dispatch({ type: 'view', ply: shownPly - 1 });
      if (e.key === 'ArrowRight') dispatch({ type: 'view', ply: shownPly + 1 });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shownPly]);

  const newGame = () => {
    if (
      live.ply > 0 &&
      !outcome &&
      !window.confirm('Start a new game? The current game will be lost.')
    ) {
      return;
    }
    dispatch({ type: 'reset' });
  };

  const exportPgn = () => {
    const now = Date.now();
    const pgn = live.toPgn({
      Event: '350 Chess local game',
      Site: '350 Chess (local)',
      Date: pgnDate(now),
      White: 'White',
      Black: 'Black',
      TimeControl: '-',
      ...(outcome ? { Termination: TERMINATION_PGN[outcome.termination] ?? 'Normal' } : {}),
    });
    downloadText(`350chess-local-${pgnDate(now).replaceAll('.', '')}.pgn`, pgn);
  };

  const top: Color = orientation === 'white' ? 'black' : 'white';

  return (
    <div className="game">
      <div className="game-board">
        <CapturedPieces material={material} side={top} />
        <Board
          id="local"
          fen={shown.fen}
          orientation={orientation}
          movable={reviewing || outcome ? null : live.turn}
          lastMove={
            lastRecord ? { from: lastRecord.uci.slice(0, 2), to: lastRecord.uci.slice(2, 4) } : null
          }
          checkSquare={shown.inCheck() ? kingSquare(shown.fen, shown.turn) : null}
          legalMovesFrom={(sq) => live.legalMovesFrom(sq)}
          onMove={(uci) => {
            const ok = live.legalMovesFrom(uci.slice(0, 2)).includes(uci);
            if (ok) dispatch({ type: 'move', uci });
            return ok;
          }}
        />
        <CapturedPieces material={material} side={orientation} />
      </div>

      <aside className="card game-side">
        <p
          role="status"
          aria-live="polite"
          className={outcome ? 'status over' : 'status'}
          data-testid="status"
        >
          {status}
        </p>

        {reviewing && (
          <p className="review-banner">
            Viewing move {shownPly} of {live.ply}.{' '}
            <button
              type="button"
              className="link"
              onClick={() => dispatch({ type: 'view', ply: null })}
            >
              Back to the game
            </button>
          </p>
        )}

        <div className="controls">
          <button
            type="button"
            onClick={() => dispatch({ type: 'undo' })}
            disabled={state.moves.length === 0}
          >
            ↶ Undo
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: 'redo' })}
            disabled={state.redo.length === 0}
          >
            ↷ Redo
          </button>
          <button
            type="button"
            onClick={() => setManualOrientation(manualOrientation === 'white' ? 'black' : 'white')}
            disabled={autoFlip}
          >
            ⇅ Flip
          </button>
          <button type="button" className="secondary" onClick={newGame}>
            New game
          </button>
        </div>

        <label className="check">
          <input
            type="checkbox"
            checked={autoFlip}
            onChange={(e) => setAutoFlip(e.target.checked)}
          />
          Flip the board after each move
        </label>

        <MoveList
          sans={live.history.map((m) => m.san)}
          currentPly={shownPly}
          onSelect={(ply) => dispatch({ type: 'view', ply })}
        />

        <button type="button" className="secondary" onClick={exportPgn} disabled={live.ply === 0}>
          ⤓ Download PGN
        </button>
        <p className="muted small">Local mode works offline. Your game is kept if you reload.</p>
      </aside>
    </div>
  );
}
