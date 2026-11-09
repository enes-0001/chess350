// Interactive board (SDD §8.3): drag-and-drop AND click-to-move, legal-move dots,
// last-move / check / selection highlights, promotion picker.
// Knows nothing about rules: legality comes from `legalMovesFrom` (core's ChessGame).
import type { Color, Uci } from '@chess350/core';
import { useState, type CSSProperties } from 'react';
import { Chessboard } from 'react-chessboard';

export interface BoardProps {
  id: string;
  fen: string;
  orientation: Color;
  /** Side allowed to move; null = nobody (game over, review, spectator). */
  movable: Color | null;
  lastMove: { from: string; to: string } | null;
  checkSquare: string | null;
  legalMovesFrom: (square: string) => Uci[];
  /** Returns true when the move was accepted. */
  onMove: (uci: Uci) => boolean;
}

const PROMOTION_CHOICES = [
  { piece: 'q', label: 'Queen', glyph: { white: '♕', black: '♛' } },
  { piece: 'r', label: 'Rook', glyph: { white: '♖', black: '♜' } },
  { piece: 'b', label: 'Bishop', glyph: { white: '♗', black: '♝' } },
  { piece: 'n', label: 'Knight', glyph: { white: '♘', black: '♞' } },
] as const;

const STYLE = {
  lastMove: { background: 'rgba(205, 210, 106, 0.6)' },
  selected: { background: 'rgba(20, 85, 30, 0.5)' },
  check: { background: 'radial-gradient(circle, rgba(255,0,0,0.8) 0%, rgba(255,0,0,0) 75%)' },
  target: { background: 'radial-gradient(rgba(20,85,30,0.45) 22%, transparent 23%)' },
  capture: {
    background: 'radial-gradient(transparent 0%, transparent 78%, rgba(20,85,30,0.45) 79%)',
  },
} satisfies Record<string, CSSProperties>;

export function Board({
  id,
  fen,
  orientation,
  movable,
  lastMove,
  checkSquare,
  legalMovesFrom,
  onMove,
}: BoardProps) {
  // Selection and pending promotion are tied to the position they were made in,
  // so they disappear automatically when the position changes (no effect needed).
  const [selection, setSelection] = useState<{ fen: string; square: string } | null>(null);
  const [promotion, setPromotion] = useState<{ fen: string; from: string; to: string } | null>(
    null,
  );
  const selected = selection?.fen === fen ? selection.square : null;
  const pending = promotion?.fen === fen ? promotion : null;

  const ownPiece = (pieceType: string | undefined) =>
    movable !== null && !!pieceType && pieceType[0] === movable[0];

  const targets = selected ? legalMovesFrom(selected) : [];

  /** Try from → to. Opens the promotion picker when needed. */
  const attempt = (from: string, to: string): boolean => {
    const candidates = legalMovesFrom(from).filter((u) => u.slice(2, 4) === to);
    if (candidates.length === 0) return false;
    setSelection(null);
    if (candidates.some((u) => u.length === 5)) {
      setPromotion({ fen, from, to });
      return false;
    }
    return onMove(from + to);
  };

  const squareStyles: Record<string, CSSProperties> = {};
  if (lastMove) {
    squareStyles[lastMove.from] = STYLE.lastMove;
    squareStyles[lastMove.to] = STYLE.lastMove;
  }
  if (checkSquare) squareStyles[checkSquare] = STYLE.check;
  if (selected) squareStyles[selected] = STYLE.selected;
  for (const u of targets) {
    const to = u.slice(2, 4);
    squareStyles[to] = isOccupied(fen, to) ? STYLE.capture : STYLE.target;
  }

  return (
    <div className="board-wrap" data-testid="board">
      <Chessboard
        options={{
          id,
          position: fen,
          boardOrientation: orientation,
          squareStyles,
          allowDragging: movable !== null && !pending,
          canDragPiece: ({ piece }) => ownPiece(piece.pieceType),
          onPieceDrop: ({ sourceSquare, targetSquare }) =>
            targetSquare ? attempt(sourceSquare, targetSquare) : false,
          onSquareClick: ({ square, piece }) => {
            if (movable === null || pending) return;
            if (selected && targets.some((u) => u.slice(2, 4) === square)) {
              attempt(selected, square);
            } else if (ownPiece(piece?.pieceType) && square !== selected) {
              setSelection({ fen, square });
            } else {
              setSelection(null);
            }
          },
        }}
      />

      {pending && movable && (
        <div className="promotion" role="dialog" aria-label="Choose promotion piece">
          <p>Promote to</p>
          <div className="promotion-choices">
            {PROMOTION_CHOICES.map((c) => (
              <button
                key={c.piece}
                type="button"
                aria-label={c.label}
                onClick={() => {
                  setPromotion(null);
                  onMove(pending.from + pending.to + c.piece);
                }}
              >
                <span className="glyph">{c.glyph[movable]}</span>
                {c.label}
              </button>
            ))}
          </div>
          <button type="button" className="secondary" onClick={() => setPromotion(null)}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

/** True when `square` holds a piece in this FEN (used to style capture targets). */
function isOccupied(fen: string, square: string): boolean {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]);
  const row = (fen.split(' ')[0] ?? '').split('/')[8 - rank] ?? '';
  let f = 0;
  for (const ch of row) {
    if (/\d/.test(ch)) f += Number(ch);
    else {
      if (f === file) return true;
      f++;
    }
    if (f > file) return false;
  }
  return false;
}
