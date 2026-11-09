// Home screen (SDD §8.1): create online game · join with code · play locally.
import { codeSchema, normalizeCode } from '@chess350/core';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';

export function Home() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const join = (e: FormEvent) => {
    e.preventDefault();
    const normalized = normalizeCode(code);
    if (!codeSchema.safeParse(normalized).success) {
      setError('That code does not look right. Codes have 6 letters/digits, e.g. K7X2QP.');
      return;
    }
    navigate(`/g/${normalized}`);
  };

  return (
    <div className="home">
      <h1>Play chess with a friend</h1>
      <p className="muted">No sign-up. Share a code, or play on this device.</p>

      <section className="card">
        <h2>Online</h2>
        {/* S3-05: open the Create-game dialog (colour + clock), then navigate to /g/<code>. */}
        <button type="button" disabled title="Coming in sprint 3 (S3-05)">
          Create online game
        </button>

        <form onSubmit={join} className="join">
          <label htmlFor="code">Join with code</label>
          <div className="row">
            <input
              id="code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(null);
              }}
              placeholder="K7X2QP"
              autoComplete="off"
              autoCapitalize="characters"
              maxLength={12}
            />
            <button type="submit">Join</button>
          </div>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
        </form>
      </section>

      <section className="card">
        <h2>Local</h2>
        <p className="muted">Two players on this device. Works offline after your first visit.</p>
        <button type="button" onClick={() => navigate('/local')}>
          Play locally
        </button>
      </section>
    </div>
  );
}
