// Captured pieces + material advantage for one side (SRS 4.1).
import type { Color } from '@chess350/core';
import type { Material } from '../lib/fen';

export function CapturedPieces({ material, side }: { material: Material; side: Color }) {
  const lead = side === 'white' ? material.diff : -material.diff;
  return (
    <p className="captured" aria-label={`Pieces captured by ${side}`}>
      <span>{material.capturedBy[side]}</span>
      {lead > 0 && <span className="lead">+{lead}</span>}
    </p>
  );
}
