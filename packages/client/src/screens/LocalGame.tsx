// Local game screen (SDD §8.5). Backlog: S2-03 (play with rules), S2-04 (undo/redo), S2-05 (flip).
import { Chessboard } from 'react-chessboard';

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export function LocalGame() {
  return (
    <div>
      <h1>Local game</h1>
      <p className="muted">
        Moves arrive in sprint 2 (S2-03). This is the board component in place.
      </p>
      <div className="board-wrap" data-testid="board">
        <Chessboard options={{ id: 'local', position: START_FEN, allowDragging: false }} />
      </div>
    </div>
  );
}
