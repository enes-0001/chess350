import { Link } from 'react-router';

export function NotFound() {
  return (
    <div className="card">
      <h1>Page not found</h1>
      <Link to="/">Back home</Link>
    </div>
  );
}
