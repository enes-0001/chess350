# AGENTS.md — 350 Chess team knowledge base

> **Read this first.** This file is for both humans (teammates) and AI coding agents (Claude Code, Codex, Cursor, Copilot, …).
> It holds everything we know and have decided, so nobody has to re-discover it.
> The detailed design lives in [`docs/SDD.md`](docs/SDD.md). This file is the _why_, the _rules_ and the _context_.
>
> **Keep it alive:** when you make a decision, learn something non-obvious, or change a rule, update this file in the same PR.

Last updated: 2026-11-09 (Checkpoint 1: offline local mode)

---

## 0. Quick start — see the app running (for humans and agents)

**Current status:** Checkpoint 1 is done. **Local mode is fully playable and works offline.** Online play (invite codes) is the next milestone (sprint 3).

**Run it.** You need Node 24 and git.

```bash
git clone https://github.com/enes-0001/chess350.git
cd chess350
npm install
npm run build
npm start
```

Then open **http://localhost:3000** and click **Play locally**.

- `npm start` runs the production server on :3000 and serves the built client too.
- **For development with hot reload**, run `npm run dev` and open **http://localhost:5173** instead.
- **If port 3000 is taken:** on Git Bash / macOS / Linux use `PORT=3100 npm start`; on PowerShell use `$env:PORT=3100; npm start`.

**What to try:**

- **Moves:** click a piece, then a highlighted square, or drag it. Illegal moves are refused.
- **Game end:** play `e4 e5 Bc4 Nc6 Qh5 Nf6 Qxf7#` to see checkmate.
- **Review:** ⏮ ◀ ▶ ⏭ or the arrow keys.
- **Other controls:** Undo/Redo, Flip, _Flip after each move_, Download PGN.
- **Promotion:** push a pawn to the last rank to get the promotion picker.
- **Persistence:** reload the page and the game is still there.
- **Offline:** after one visit, stop the server (or go offline) and reload `/local`. It still works.

**Verify everything** (what CI runs):

```bash
npm run check
npm run build
npx playwright install chromium
npm run e2e
```

- `npm run check` is lint + format + typecheck + unit/integration tests.
- `npx playwright install chromium` is needed once only.
- `npm run e2e` is 33 browser tests (local mode, offline, smoke).

**Agents:** read §1–§5 and §11 before changing code. The plan with task IDs is [`docs/BACKLOG.md`](docs/BACKLOG.md).

---

## 1. TL;DR

- **What:** a web chess app, "350 Chess".
  - **Online mode:** play a friend via a 6-character invite code or link, with optional spectators.
  - **Local mode:** two players on one device, works offline.
  - No accounts, no database.
- **Who:** we are the **developer team**. The **client** is Team 3, the authors of `Team3_SRS.pdf`: Alexis Rodet, Ahmed Ouarda, Marcell Vizhanyo, Ors Mandli.
- **Course:** CS350 Introduction to Software Engineering (KAIST, Prof. Shin Yoo). The **process** is graded as much as the product.
- **Stack:** TypeScript monorepo:
  - `core`: pure rules/clock/protocol, built on chess.js and zod
  - `server`: Node + Socket.IO, rooms in memory
  - `client`: React + Vite + react-chessboard
- **Golden rule:** the server is the single source of truth. Clients send intents, the server validates and broadcasts full versioned snapshots.
- **Hard deadline:** **2026-12-18 18:00** — team report + individual reports on KLMS. Final presentation date: **TBD — check the course schedule**.

---

## 2. Course context — what we must deliver

The course project has two roles per team:

1. **Client:** our own SRS was picked by another team. We act as their client.
2. **Developer:** we build Team 3's SRS. This repo.

### 2.1 Required interactions with our client (Team 3)

- **At least two sync points**, reported in the final report:
  - **Sync 1:** early, to check progress and design direction.
  - **Sync 2:** near the end, before the final presentation, to check expectations.
- At least one discussion face to face or by video call.
- An agile spirit is expected: involve the client in major decisions.
- **Record every meeting** in `docs/meetings/` using the template in §9.

### 2.2 Deliverables checklist (due 2026-12-18 18:00, KLMS)

**Team report** (every member submits it):

- [ ] Experience **as client**: at least 3 interactions with our developer team, summaries of 2 meetings, and a 10-point peer evaluation of that developer team.
- [ ] Experience **as developer** (this project): development progress, interactions with the client (how the project changed due to feedback), summary of each meeting, and how course knowledge helped or did not help.
- [ ] GitHub repository link.
- [ ] **AI usage disclosure (team):** whether AI was used, which tools, how they assisted, and how the experience was.

**Individual report** (each member):

- [ ] What I contributed, as client and as developer.
- [ ] What I learnt.
- [ ] A 10-point peer evaluation for each teammate.
- [ ] **AI usage disclosure (individual).**

**Other:**

- [ ] SDD submitted on KLMS (one per team). Source: `docs/SDD.md`.

> Because the AI disclosure is mandatory, **log AI usage as you go** in [`docs/ai-usage-log.md`](docs/ai-usage-log.md). Reconstructing it in December will be painful and inaccurate.

### 2.3 Key dates

| Date                 | What                                                 |
| -------------------- | ---------------------------------------------------- |
| 2026-11-09           | SRS chosen. SDD v0.1 drafted. Lichess research done. |
| Week of Nov 9        | **Sync 1** with Team 3 — _date TBD_                  |
| 2026-12-13           | Code freeze (planned)                                |
| Week of Dec 7        | **Sync 2** with Team 3 — _date TBD_                  |
| _TBD_                | Final presentation                                   |
| **2026-12-18 18:00** | Team + individual reports due                        |

---

## 3. Product summary (from the SRS)

The full list with IDs is in SDD §17. Priorities:

- **Must:**
  - F1 all moves (castling, en passant, promotion)
  - F2 legal-move highlight / reject illegal moves
  - F3 check, mate, stalemate, draws (50-move, threefold, insufficient material)
  - F4 resign + draw offers
  - F5 create room + code
  - F6 colour + time control
  - F7 join by code or link
  - F8 server-validated real-time moves
  - F11 reject invalid/expired/full codes
  - F12 local two-player
- **Should:**
  - F9 reconnect
  - F10 opponent status + abandonment
  - F13 local undo/redo
  - F16 clocks (presets + custom; server-authoritative online)
  - F22 step through moves
  - F23 30-minute review window
  - F24 PGN export
- **Could:**
  - F14 board flip
  - F15 bot ≥ 1500 Elo
  - F17 chat
  - F18 spectators
  - F19 online takeback request
  - F22b branching review
- **Out of scope:** accounts (F20), permanent history (F21), matchmaking, ratings, engine analysis, variants, native apps.

**NFRs:**

- p95 move delivery < 200 ms
- page load < 3 s
- clock drift < 1 s
- ≥ 200 concurrent rooms
- start/join a game in < 30 s
- fully usable on touch
- latest 2 versions of Chrome/Firefox/Safari/Edge
- HTTPS
- no personal data

**SRS errata and interpretations** — we follow SDD §1.5 (A1–A12) until the client confirms. Most important:

- **F22 duplicated:** we renamed the branching one to F22b.
- **F20/F21:** out of scope.
- **Draws are automatic.**
- **Full room → spectator.**
- **Abandonment:** 60 s.
- **Clocks start after both first moves;** a missing first move aborts the game after 30 s.

---

## 4. Architecture in one screen

```
packages/core    pure TS: rules (chess.js wrapper), clock (pure fns), protocol (zod), pgn, config
packages/server  Node + Express + Socket.IO; RoomManager -> Room aggregate; timers; rate limits
packages/client  React + Vite; screens; online store (renders server snapshots); local controller; bot worker
```

**Online flow:**

```
client: room:join {code, token?}  → ack {role, token?, state}
client: game:move {uci, ply}      → server validates (turn, ply, legality, clock)
server: room:state {v, fen, moves, clock, ...} to everyone in the room → ack {ok}
```

Details: SDD §5–§11.

---

## 5. Invariants — never break these

If a change seems to require breaking one, **stop and discuss with the team first.** Then record the decision as an ADR (§7).

1. **Server-authoritative.** In online mode, only the server decides legality, turn, time and result. Never trust client-sent FEN, clock values or results.
2. **`core` is pure.** No `Date.now()`, `setTimeout`, `Math.random()`, network, DOM or Node APIs inside `packages/core`. Time and randomness are passed in.
3. **Injected time on the server too.** Use the `Clock`/`Scheduler` interfaces from `server/src/infra/time`, never globals. This is what makes clock and timeout tests deterministic.
4. **No `await` between reading and mutating room state** in a handler. Node's single thread then makes each command atomic. Breaking this reintroduces join/move races.
5. **Every inbound message is zod-validated.** Unknown or invalid input gets an error code, never a crash.
6. **Every state change bumps `room.version` and broadcasts a full `RoomState`.** Clients ignore snapshots with `v ≤ lastV`.
7. **Moves carry `ply` and are idempotent.** A duplicate `(seat, ply, uci)` is acked `ok` without re-applying.
8. **Seat tokens never appear in URLs, logs or snapshots.** Store only the SHA-256 hash server-side and compare in constant time.
9. **Integer milliseconds for all times.** No floats, no seconds in the protocol.
10. **Chat is rendered as text only.** Never `dangerouslySetInnerHTML`.
11. **One code path to bind a socket to a room:** `room:join`, including right after create and after every reconnect.
12. **Protocol types live only in `core/protocol`.** Client and server import them, never redefine them.
13. **No new runtime dependency without a one-line ADR** (§7). Check its license first: we avoid GPL unless ADR-010 says otherwise.

---

## 6. Conventions

### 6.1 Code

- TypeScript `strict`. No `any` without a `// reason:` comment. Prefer discriminated unions and typed results (`{ok:true}|{ok:false,error}`) over throwing in domain code.
- **Naming:**
  - files: `camelCase.ts`
  - React components: `PascalCase.tsx`
  - constants: `UPPER_SNAKE` in `core/src/config.ts`
- **Imports:** `core` never imports from `server` or `client`; `server` and `client` never import each other.
- Formatting by Prettier. Linting by ESLint. Both run in CI.
- Small functions, no clever one-liners in rule or clock logic. Readability beats brevity.

### 6.2 Tests

- **Every bug fix starts with a failing test.**
- **Where tests go:**
  - unit tests next to the code: `foo.test.ts`
  - integration tests in `packages/server/test/`
  - E2E tests in `packages/client/e2e/`
- **Test IDs** from SDD §16.2 (`T-R1`, `T-M8`, `E3`, …) appear in test names, e.g. `it('T-M8: abandon after 60s', …)`.
- Use fake timers / an injected clock, **never real `sleep`**.
- **Two players in E2E = two Playwright browser contexts.** Same-context tabs share `localStorage`, i.e. the same identity (see §8.4).

### 6.3 Git and PRs

- **Branches:** `feat/F8-move-sync`, `fix/...`, `docs/...`, `test/...`, `chore/...`.
- **Conventional Commits:** `feat(server): accept duplicate move idempotently (F8)`.
- Small PRs, at least one reviewer, CI green, squash-merge into protected `main`.
- **PR description must include:**
  - the issue (`Closes #12`)
  - requirement ID(s) (`F8`)
  - how it was tested
  - whether AI assisted (and log it)

### 6.4 Definition of Done

1. The issue's acceptance criteria are met.
2. Tests are added or updated, and CI is green.
3. SDD / `AGENTS.md` are updated if behaviour, protocol or decisions changed.
4. The PR is linked to its `F#` issue.
5. AI assistance is logged in `docs/ai-usage-log.md`.

### 6.5 Commands

Requires Node 24 (`.nvmrc`). Run everything from the repo root.

| Command                      | Does                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| `npm install`                | Install all workspaces                                                                |
| `npm run dev`                | Server (:3000, `tsx watch`) + client (:5173, Vite, proxies `/socket.io`) — open :5173 |
| `npm run check`              | **Run before every PR:** lint + format check + typecheck + unit/integration tests     |
| `npm test`                   | Unit + integration tests (Vitest) in all packages                                     |
| `npm run lint` / `format`    | ESLint (incl. invariant rules) / Prettier write                                       |
| `npm run typecheck`          | `tsc` in every package                                                                |
| `npm run build`              | Production build: `packages/client/dist` + `packages/server/dist/index.js`            |
| `npm start`                  | Run the production build on :3000 (serves the client too)                             |
| `npm run e2e`                | Playwright E2E against the production build (run `npm run build` first)               |
| `docker build -t chess350 .` | Production image                                                                      |
| _(S5-06)_ `npm run loadtest` | 200-room load test (not created yet)                                                  |

### 6.6 Where things are, and how to find open work

- **Plan:** [`docs/BACKLOG.md`](docs/BACKLOG.md). Every task has an ID like `S3-02`.
- **Open code:** `grep -rn "notImplemented(" packages/` lists every unimplemented function, tagged with its task ID.
- **Open tests:** `it.todo(...)` / `test.fixme(...)` entries carry the SDD test IDs (`T-M4`, `E3`). Turn them into real tests when you implement the feature.
- **Invariants in code:** `eslint.config.js` enforces invariants #2, #3, #10 and the import rules. A lint error mentioning an invariant is a design rule, not style. Do not disable it.

---

## 7. Decision log (lightweight ADRs)

Format: **ID — decision** (date, status). _Why._ Add new ones at the bottom. Never delete: supersede.

- **ADR-001 — TypeScript monorepo with `core` / `server` / `client`** (2026-11-09, accepted). _One language. Shared rules and protocol types. Pure core is testable and reused by local mode._
- **ADR-002 — chess.js for rules** (2026-11-09, accepted). _Complete FIDE rules incl. all draw conditions and PGN. BSD-2. Writing our own move generator is high-risk and low-value._
- **ADR-003 — Socket.IO instead of raw `ws`** (2026-11-09, accepted). _Heartbeats, auto-reconnect, rooms and acks out of the box. Still WebSocket underneath (RFC 6455). One transport for everything; no REST except `/healthz`._
- **ADR-004 — Full versioned snapshots, not deltas or event replay** (2026-11-09, accepted). _Eliminates desync bugs and makes reconnect trivial. Snapshots are a few KB. Lichess replays events by version instead; we chose simplicity._
- **ADR-005 — No database; rooms in memory; single instance** (2026-11-09, accepted). _Allowed by SRS 2.4. A restart loses games: accepted and shown clearly in the UI._
- **ADR-006 — Seat token in `localStorage`, sent in `room:join`; never in URLs** (2026-11-09, accepted). _Links get shared, screenshotted and stored in history. The public code must only grant spectating or the empty seat. Lichess uses an httpOnly cookie + 4-char suffix in the socket URL; `localStorage` is simpler for us and works per-room._
- **ADR-007 — Automatic draws for threefold / 50-move** (2026-11-09, proposed — confirm at Sync 1). _SRS says "detect". Claims add UI complexity._
- **ADR-008 — react-chessboard (MIT) over chessground (GPL-3.0)** (2026-11-09, accepted). _License and React fit._
- **ADR-009 — Injected time everywhere; integer ms** (2026-11-09, accepted). _Deterministic tests for clocks and timeouts. Mirrors `scalachess` (`timestamper`)._
- **ADR-010 — Bot engine and project license** (2026-11-09, **open**). _Stockfish (WASM) is GPL-3.0. If we ship it, the simplest compliant path is to license the whole repo GPL-3.0 (the source is public on GitHub anyway). Alternative: no bot, or a self-written weak engine (unlikely to reach 1500 Elo). Decide with the client before starting F15._
- **ADR-011 — No lag compensation; fixed 300 ms flag grace** (2026-11-09, accepted). _YAGNI. Revisit only if Sync 2 testing shows unfair flags._
- **ADR-012 — Clocks start after both first moves; 30 s first-move timeout aborts** (2026-11-09, proposed). _Matches lichess. Avoids losing on time because the opponent was slow to open the link._
- **ADR-013 — Hand-written service worker instead of vite-plugin-pwa** (2026-11-09, accepted). _~30 lines plus a tiny Vite plugin that injects the exact build file list. No dependency to keep compatible with Vite 8. Every line is readable and testable (E2E offline test). Revisit if we need install prompts or a web manifest._
- **ADR-014 — Local games persist in `localStorage`** (2026-11-09, accepted). _A refresh or crash must not lose a game on a phone. The data is per device, validated on load, and never sent anywhere. It is not "permanent game history" (F21 stays out of scope)._

---

## 8. Research notes — lichess.org (2026-11-09)

We studied lichess because it already does exactly what our SRS asks for. Method:

- Opened a friend game shared by a teammate.
- Created our own 5+3 casual friend games.
- Hooked `WebSocket.prototype.send` in the page to log traffic.
- Read `scalachess/core/src/main/scala/Clock.scala` on GitHub.

### 8.1 Friend-game setup dialog ("Challenge a friend")

- One screen: **Variant** (we skip it), **Time**, **Side**, and one button.
- **Time:** three tabs — _Unlimited_, _Real time_, _Correspondence_.
  - Real time has two sliders (minutes per side, increment seconds).
  - Preset buttons: `1+0 2+1 3+0 3+2 5+0 5+3 10+0 10+5 15+10 30+0`.
- **Side:** three big buttons: White / **Random (default)** / Black.
- **After creating:**
  - A page shows the invite link, a **QR code**, and **"The first person to come to this URL will be your opponent."**
  - A **Cancel** button.
  - The tab title reads "Challenge from Anonymous".

→ Our create dialog (SDD §8.1) follows this, without variants or correspondence.

### 8.2 Identity model

- **Public game URL:** `lichess.org/<8-char gameId>`, e.g. `lichess.org/game/kcQTHmoY`.
  - Opening it without being a player shows the tab title "… • spectator".
  - Watchers connect to `wss://socket0.lichess.org/watch/<gameId>/white/v6?sri=<random>&v=<version>`.
- **Player socket:** `wss://socket0.lichess.org/play/<gameId><4-char player secret>/v6?...`, e.g. `/play/APsvfkPUCJnQ` (`APsvfkPU` + `CJnQ`).
- **Anonymous players are bound to the game via an httpOnly session cookie.**
  - Proof: when we accepted a challenge with `fetch(..., {credentials: 'omit'})`, the game started, but the joining side's identity was lost. The cookie never got stored.
  - Proof: opening our own challenge link in the same browser showed the creator's view, not "join".

→ We use a public code plus a secret seat token (ADR-006). **Testing consequence:** two players need two separate storage contexts (two browsers, a private window, or two Playwright contexts).

### 8.3 Captured WebSocket messages

Spectator connection:

```
→ "p"                               (ping every few seconds)
← "0"                               (pong)
← {"t":"crowd","d":{"white":true,"black":true,"watchers":{}}}
```

Player connection, after creating a 5+3 game as white and playing 1.e4:

```
→ {"t":"move","d":{"u":"e2e4","b":1,"l":286,"a":1}}
     u = UCI move, a = ack id, l = client-measured lag (ms), b = blur flag (anti-cheat)
← {"t":"ack","d":1}                                         (~300 ms later)
← {"t":"move","v":1,"d":{"uci":"e2e4","san":"e4",
     "fen":"rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR","ply":1,
     "clock":{"white":300,"black":300}}}
```

**Takeaways:**

- **Envelope `{t, d}` plus a version `v`.** Moves are sent as **UCI**. The server answers with **san, fen, ply, clock**.
- **Ack per command id.** The client can safely re-send.
- **Clocks were still 300/300 after 1.e4:** clocks start only after both players' first moves.
- **Before the first move:** the UI shows **"Abort game"**, and **Resign** is disabled.
- **Presence:** the opponent's name has a hollow dot when disconnected and a green dot when connected. This is driven by `crowd`.

### 8.4 `scalachess` `Clock.scala` (source read)

- `Clock` is an **immutable value**: `config`, `color` (side to move), `players` (each with `elapsed`, `lag`, `berserk`), and `timer: Option[Timestamp]` (when the current turn started).
- `remainingTime(c) = limit − elapsed − (now − timer)` for the side to move.
- **On a move:**
  - `elapsed = now − timer`, minus lag compensation
  - `takeTime(moveTime − increment)`
  - switch side
  - **increment only if the move was made in time**
- **`outOfTime(c, withGrace)`** allows a small lag quota, capped at 2 s.
- **The time source is injected** (`timestamper`). This is the same idea as our invariant #3.
- All durations are in **centiseconds** (integers). We use integer ms.
- **Not copied (YAGNI):**
  - per-player lag tracking/compensation
  - berserk
  - "moretime"
  - separate socket server (`lila-ws`)
  - event replay by version

### 8.5 UX details worth copying

- **Tab title reflects state:** "Your turn", "Waiting for opponent", "spectator", "Game over".
- **Separate sounds:** `Move`, `Capture`, `Check`, `Checkmate`, `GenericNotify`.
- **SVG piece set** (crisp on mobile).
- **Move list** with ⏮ ◀ ▶ ⏭ that also works during the game.
- **Material difference** shown as captured-piece icons plus "+N".
- **Action icons only:** ✕ abort, ½ draw, ⚑ resign, ↶ takeback.

### 8.6 Practical notes for future research

- lichess.org is behind **Cloudflare bot protection**. Automated or embedded browsers get a "Verify you are human" challenge on many navigations, and a human must click it. Agents must **not** try to bypass it; ask a human.
- Lichess's public export endpoint works: `GET /game/export/<id>` (PGN), or with `Accept: application/json`. It may lag behind the live game (cache).
- Lichess code: `lichess-org/lila` (Scala app), `lichess-org/lila-ws` (WebSocket server), `lichess-org/scalachess` (rules + clock), `lichess-org/chessground` (board, GPL-3.0).

---

## 9. Meetings

### 9.1 Log

| #   | Date  | Type                      | With   | Notes file                          |
| --- | ----- | ------------------------- | ------ | ----------------------------------- |
| 1   | _TBD_ | Sync 1 (design direction) | Team 3 | `docs/meetings/YYYY-MM-DD-sync1.md` |
| 2   | _TBD_ | Sync 2 (acceptance)       | Team 3 | `docs/meetings/YYYY-MM-DD-sync2.md` |

### 9.2 Template (`docs/meetings/YYYY-MM-DD-<topic>.md`)

```markdown
# <Topic> — YYYY-MM-DD

- Type: Sync 1 / Sync 2 / sprint review / internal
- Attendees: (names, team)
- Medium: in person / Zoom / Slack

## Agenda

1. ...

## Discussion & decisions

- D1: ... (affects F#, SDD §, ADR-0xx)

## Requirement changes

| Req | Before | After | Reason |

## Action items

| Owner | Action | Due |

## Notes for the final report

- How the project changed because of this meeting: ...
```

---

## 10. AI usage policy (course requires disclosure)

- **AI tools are allowed.** Disclosure is mandatory in both the team and the individual reports.
- **After any meaningful AI-assisted work,** append a row to [`docs/ai-usage-log.md`](docs/ai-usage-log.md): date, person, tool, task, what was used, what was changed or rejected.
- **The human who merges AI-written code owns it:** review it, test it, understand it.
- **Never paste secrets into AI tools.** We have none besides deploy credentials; keep it that way.

---

## 11. Instructions for AI agents working in this repo

1. **Read order:** this file → `docs/SDD.md` (the sections relevant to your task) → the code you will touch → its tests.
2. **Respect the invariants (§5).** If a task seems to need breaking one, stop and ask the human instead of working around it.
3. **Requirements come from the SRS via SDD §17.** Do not add features that are not in the SRS or an issue. Scope changes need the client's approval (record them in a meeting note).
4. **Test first** for logic in `core` and `server/rooms`. Use injected time, never real sleeps. Name tests with their SDD test IDs.
5. **Update docs in the same change:**
   - protocol or behaviour change → SDD §11 / §10
   - new decision → ADR in §7
   - new non-obvious finding → §8 or a new section here
6. **Dependencies:** check the license (no GPL unless ADR-010 is resolved that way) and add an ADR line.
7. **Do not:**
   - commit secrets or tokens
   - put seat tokens in URLs or logs
   - use `dangerouslySetInnerHTML`
   - call `Date.now()` / `Math.random()` in `core`
   - add `await` inside room mutation handlers
   - weaken validation to make a test pass
8. **External sites:**
   - Do not try to bypass bot protection (e.g. Cloudflare on lichess); ask a human.
   - Do not create accounts.
   - Do not spam public services with test games.
9. **Before finishing:** run lint, typecheck and tests. Summarise what changed, how it was verified, and what is not done. Remind the human to log AI usage.

---

## 12. Glossary (short)

The full table is in SDD §1.4.

| Term           | Meaning                                   |
| -------------- | ----------------------------------------- |
| room           | Server-side game session                  |
| code           | Public 6-char invite code                 |
| seat / token   | Player slot / its secret                  |
| ply            | Half-move                                 |
| UCI            | `e2e4` wire format for moves              |
| SAN            | `Nf3` display format                      |
| FEN            | Board position string                     |
| snapshot / `v` | Full room state / its version             |
| abort          | Cancel before both first moves, no result |
| abandon        | Disconnected past the grace period, loss  |
| flag           | Run out of time                           |
