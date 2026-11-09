# 350 Chess

A web-based chess app with **online play** via invite code and **local play** on one device. No accounts, no database.
It is built for the CS350 (KAIST) team project. The client is Team 3, and the requirements come from their SRS.

## Status

| Milestone                              | State       | What you can do                                                                              |
| -------------------------------------- | ----------- | -------------------------------------------------------------------------------------------- |
| Skeleton (tooling, CI, server, client) | ✅ done     | `npm run check`, CI on every push/PR                                                         |
| **Checkpoint 1 — offline local mode**  | ✅ **done** | Play a full game on one device, also offline. Undo/redo, review, flip, promotion, PGN export |
| Online play (invite codes)             | ⏳ sprint 3 | Create/join a room, real-time moves validated by the server                                  |
| Clocks, reconnect, abandonment         | ⏳ sprint 4 | Server-authoritative clocks, rejoin after refresh                                            |
| Could-haves (chat, spectators, bot)    | ⏳ sprint 5 | See [`docs/BACKLOG.md`](docs/BACKLOG.md)                                                     |

### Checkpoint 1 features

| Requirement                                                                  | Where                                                        |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------ |
| F1–F3 all FIDE rules, check/mate/stalemate, automatic draws                  | `packages/core/src/rules/chessGame.ts` (chess.js)            |
| F2 legal-move dots, illegal moves refused, last-move & check marks           | `packages/client/src/components/Board.tsx`                   |
| F12 two players on one device, click-to-move **and** drag-and-drop           | `packages/client/src/screens/LocalGame.tsx`                  |
| F13 undo / redo                                                              | `packages/client/src/local/localGame.ts`                     |
| F14 flip board, optional auto-flip after each move                           | `LocalGame.tsx`                                              |
| F22 step through moves (⏮ ◀ ▶ ⏭, click a move, ← → keys)                     | `packages/client/src/components/MoveList.tsx`                |
| F24 download the game as PGN                                                 | `ChessGame.toPgn()`                                          |
| SRS 2.3 local mode works **offline** after the first visit                   | `packages/client/build/sw.template.js` (service worker)      |
| Captured pieces + material difference, promotion picker, game kept on reload | `components/CapturedPieces.tsx`, `Board.tsx`, `localGame.ts` |

## Try it

You need **Node 24** (see `.nvmrc`) and git.

```bash
git clone https://github.com/enes-0001/chess350.git
cd chess350
npm install
npm run build
npm start
```

Open **http://localhost:3000** and click **Play locally**.

- **Port 3000 busy?** Use `PORT=3100 npm start`. On PowerShell: `$env:PORT=3100; npm start`.
- **While developing,** use `npm run dev` and open http://localhost:5173 (hot reload). Offline mode only works in the production build.

**Things to try:**

- Play `e4 e5 Bc4 Nc6 Qh5 Nf6 Qxf7#` to see checkmate.
- Push a pawn to the last rank to get the promotion picker.
- Use undo, redo and review.
- Download the game as PGN.
- Reload the page: the game is still there.
- After one visit, stop the server and reload `/local`: it still works offline.

> **Using an AI agent?** Point it at [`AGENTS.md`](AGENTS.md). §0 tells it how to run and verify the app, and the rest explains the design rules.

## Verify

```bash
npm run check
npm run build
npx playwright install chromium
npm run e2e
```

- `npm run check` runs lint, format check, typecheck, and unit + integration tests.
- `npx playwright install chromium` is needed once only.
- `npm run e2e` runs the browser tests: local mode, offline, smoke.

CI runs the same checks plus a Docker build on every push to `main` and every PR.

## Documentation

| Read                                           | What it is                                                                                                                        |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| [`AGENTS.md`](AGENTS.md)                       | **Start here.** Quick start, course deliverables and deadlines, rules we never break, conventions, decision log, lichess research |
| [`docs/BACKLOG.md`](docs/BACKLOG.md)           | Sprint plan: every task with ID, requirement, owner role, tests and dependencies                                                  |
| [`docs/SDD.md`](docs/SDD.md)                   | Software Design Document: architecture, protocol, clock rules, testing, plan (submitted to KLMS)                                  |
| [`docs/ai-usage-log.md`](docs/ai-usage-log.md) | AI usage log, required for the final reports. Add a row whenever you use AI                                                       |
| `docs/meetings/`                               | Client and team meeting notes (template inside)                                                                                   |

## Repository layout

```
packages/core     pure TypeScript: rules (ChessGame), clock, protocol schemas, PGN — shared by server and client
packages/server   Node + Express + Socket.IO, rooms in memory (online play: sprint 3)
packages/client   React + Vite + react-chessboard; local game, service worker, Playwright E2E tests
docs/             SDD, backlog, meeting notes, AI usage log
.github/          CI workflow, PR and issue templates
```

## Team

| Name                                          | Role (SDD §19) |
| --------------------------------------------- | -------------- |
| _you — add yourself in your first PR (S1-06)_ |                |

## Key dates

- **Sync 1 with the client:** week of Nov 9, 2026 (date TBD)
- **Sync 2 with the client:** week of Dec 7, 2026 (date TBD)
- **Code freeze:** Dec 13, 2026
- **Final reports due:** **Dec 18, 2026 18:00**, on KLMS
