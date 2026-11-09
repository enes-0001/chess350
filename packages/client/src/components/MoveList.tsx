// Move list with ⏮ ◀ ▶ ⏭ navigation (F22, SDD §14). Works during the game and after it.
export interface MoveListProps {
  sans: readonly string[];
  /** Ply currently shown on the board (0 = start position). */
  currentPly: number;
  onSelect: (ply: number) => void;
}

export function MoveList({ sans, currentPly, onSelect }: MoveListProps) {
  const last = sans.length;
  const rows: { n: number; white?: string; black?: string }[] = [];
  sans.forEach((san, i) => {
    if (i % 2 === 0) rows.push({ n: i / 2 + 1, white: san });
    else rows[rows.length - 1]!.black = san;
  });

  const cell = (san: string | undefined, ply: number) =>
    san === undefined ? (
      <span />
    ) : (
      <button
        type="button"
        className="move"
        aria-current={ply === currentPly ? 'step' : undefined}
        onClick={() => onSelect(ply)}
      >
        {san}
      </button>
    );

  return (
    <div className="movelist">
      <div className="movelist-nav" role="group" aria-label="Move navigation">
        <button
          type="button"
          aria-label="First move"
          onClick={() => onSelect(0)}
          disabled={currentPly === 0}
        >
          ⏮
        </button>
        <button
          type="button"
          aria-label="Previous move"
          onClick={() => onSelect(currentPly - 1)}
          disabled={currentPly === 0}
        >
          ◀
        </button>
        <button
          type="button"
          aria-label="Next move"
          onClick={() => onSelect(currentPly + 1)}
          disabled={currentPly === last}
        >
          ▶
        </button>
        <button
          type="button"
          aria-label="Last move"
          onClick={() => onSelect(last)}
          disabled={currentPly === last}
        >
          ⏭
        </button>
      </div>
      {rows.length === 0 ? (
        <p className="muted small">No moves yet.</p>
      ) : (
        <ol className="moves" aria-label="Moves">
          {rows.map((r) => (
            <li key={r.n}>
              <span className="num">{r.n}.</span>
              {cell(r.white, r.n * 2 - 1)}
              {cell(r.black, r.n * 2)}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
