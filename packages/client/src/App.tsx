// Routes (SDD §8.1).
import { Link, Route, Routes } from 'react-router';
import { Home } from './screens/Home';
import { LocalGame } from './screens/LocalGame';
import { NotFound } from './screens/NotFound';
import { OnlineGame } from './screens/OnlineGame';

export function App() {
  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand">
          ♞ 350 Chess
        </Link>
      </header>
      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/local" element={<LocalGame />} />
          <Route path="/g/:code" element={<OnlineGame />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}
