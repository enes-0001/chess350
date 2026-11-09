// Online game screen (SDD §8.1–§8.4). Backlog: S3-04 (socket client + store), S3-05 (UI).
import { codeSchema, normalizeCode } from '@chess350/core';
import { Link, useParams } from 'react-router';

export function OnlineGame() {
  const { code = '' } = useParams();
  const normalized = normalizeCode(code);
  const valid = codeSchema.safeParse(normalized).success;

  if (!valid) {
    return (
      <div className="card">
        <h1>Invalid code</h1>
        <p role="alert">“{code}” is not a valid game code.</p>
        <Link to="/">Back home</Link>
      </div>
    );
  }

  return (
    <div className="card">
      <h1>Game {normalized}</h1>
      <p className="muted">Online play arrives in sprint 3 (S3-04, S3-05).</p>
    </div>
  );
}
