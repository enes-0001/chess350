# 350 Chess — Backlog & sprint plan

This is the working plan derived from SDD §17 (traceability) and §19 (milestones).

- **Task IDs** (`S2-01`, …) are referenced from code (`notImplemented('S2-01 …')`) and from test `todo`s. `grep -r "S2-01" packages/` shows where a task lives.
- **One task = one GitHub issue = one (or a few) PRs.** Copy each row into an issue using the _Task_ template. Title it `S2-01: ChessGame moves`.
- **Roles** (from SDD §19): **C** = Core & local mode, **S** = Server, **F** = Frontend, **Q** = QA / DevOps / docs. Owners are suggestions; pick up tasks from other tracks when yours is blocked.
- **Status:** ☐ todo · ◐ in progress · ☑ done. Update it here or on the GitHub Projects board, not both.

Dates: today is 2026-11-09. Code freeze is 2026-12-13. Reports are due **2026-12-18 18:00**.

---

## Sprint 1 — Setup & design (Nov 9 – 15)

**Goal:** everyone can run the project. The design is agreed with the client. Deploy works.

| ID    | Status | Task                                                                                                                                          | Req | Role | Done when                                         |
| ----- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------- | --- | ---- | ------------------------------------------------- |
| S1-01 | ☑      | Monorepo skeleton: core/server/client, TypeScript, ESLint (with invariant rules), Prettier, Vitest, Playwright, CI, Dockerfile                | —   | Q    | `npm run check` green locally and in CI           |
| S1-02 | ☐      | Fill in team name, member names and role owners in SDD (header, §19) and AGENTS.md. Submit SDD to KLMS                                        | —   | all  | SDD submitted                                     |
| S1-03 | ☐      | **Sync 1 with Team 3:** walk through SDD, resolve A1–A12 and §21 questions. Notes in `docs/meetings/`                                         | —   | all  | Meeting note committed. SDD §1.5 statuses updated |
| S1-04 | ☐      | GitHub setup: protect `main` (require CI + 1 review), Projects board, labels (`must/should/could`, `area:*`), create issues from this backlog | —   | Q    | Issues exist, board in use                        |
| S1-05 | ☐      | Pick an always-on host (Fly.io / Railway / …). Deploy the skeleton with `ALLOWED_ORIGINS`. Verify `/healthz` over HTTPS                       | 2.3 | Q    | Public URL in README                              |
| S1-06 | ☐      | **Onboarding, each member:** clone, `npm install`, `npm run dev`, `npm run check`. First PR adds your name to the README team table           | —   | all  | 4 merged PRs                                      |

## Sprint 2 — Rules engine & local mode (Nov 16 – 22)

**Goal:** a complete local game is playable on desktop and phone.

| ID    | Status | Task                                                                                                                                         | Req     | Role | Tests               | Depends on |
| ----- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---- | ------------------- | ---------- |
| S2-01 | ☐      | `ChessGame`: constructor replay, `turn`, `ply`, `fen`, `history`, `inCheck`, `legalMovesFrom`, `tryMove` (promotion letter required)         | F1, F2  | C    | T-R1–3, T-R10       | —          |
| S2-02 | ☐      | `outcomeByRules` (automatic draws, A4) and `canMate` (A5)                                                                                    | F3      | C    | T-R4–9              | S2-01      |
| S2-03 | ☐      | `LocalController` + local game UI: drag & click-to-move, legal-move dots, last-move and check highlight, promotion dialog, game-over message | F2, F12 | F    | unit + E6 (partial) | S2-01      |
| S2-04 | ☐      | Undo / redo in untimed local games (A9)                                                                                                      | F13     | C    | unit                | S2-03      |
| S2-05 | ☐      | Board flip toggle (flip after each move)                                                                                                     | F14     | F    | E6                  | S2-03      |
| S2-06 | ☐      | `MoveList` component with ⏮ ◀ ▶ ⏭ and click-to-jump, reused online later                                                                     | F22     | F    | unit                | S2-01      |
| S2-07 | ☐      | Captured pieces + material difference (+N)                                                                                                   | 4.1     | F    | unit                | S2-01      |
| S2-08 | ☐      | Responsive layout (board sizing, stacked panel < 768 px, 44 px targets). Test on a real phone                                                | 5.4     | F    | E8                  | S2-03      |
| S2-09 | ☐      | Sprint review: demo local mode to each other. Retro note in `docs/meetings/`                                                                 | —       | all  | —                   | —          |

## Sprint 3 — Online MVP (Nov 23 – 29)

**Goal:** two browsers play a full game on the deployed server.

| ID    | Status | Task                                                                                                                                                                | Req             | Role | Tests             | Depends on |
| ----- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ---- | ----------------- | ---------- |
| S3-01 | ☐      | `RoomManager.create`, `room:join` (seat by token / empty seat / spectator / `ROOM_FULL`), `Room.snapshot`, tokens hashed                                            | F5, F6, F7, F11 | S    | T-M1–3, T-P2      | S2-01      |
| S3-02 | ☐      | `game:move`: turn, ply, legality, idempotent duplicates, version bump, broadcast                                                                                    | F8              | S    | T-M4, T-M10, T-P3 | S3-01      |
| S3-03 | ☐      | Resign, abort (+30 s first-move timeout), draw offer/accept/decline, `room:cancel`                                                                                  | F4              | S    | T-M5–7            | S3-02      |
| S3-04 | ☐      | Client socket layer + online store: join on every `connect`, token in `localStorage` (try/catch), optimistic move + rollback, ignore `v ≤ lastV`, connection banner | F7, F8          | F    | unit              | S3-01      |
| S3-05 | ☐      | Create-game dialog (colour, untimed for now) + online game screen (presence dots, invite code copy/share, resign/draw/abort buttons)                                | F5, F6          | F    | E1 (partial), E5  | S3-04      |
| S3-06 | ☐      | Rate limiter (token buckets, SDD §7.7) wired into the handler pipeline                                                                                              | 5.2             | S    | T-P5              | S3-01      |
| S3-07 | ☐      | E2E: two-context game (E1 without clocks/PGN), invalid code (E2)                                                                                                    | —               | Q    | E1, E2            | S3-05      |
| S3-08 | ☐      | Deploy and play a real game between two phones. Fix what breaks                                                                                                     | —               | all  | manual            | S3-05      |

## Sprint 4 — Robustness, clocks, review (Nov 30 – Dec 6)

**Goal:** all _Must_ and _Should_ requirements done.

| ID    | Status | Task                                                                                                                    | Req      | Role | Tests             | Depends on   |
| ----- | ------ | ----------------------------------------------------------------------------------------------------------------------- | -------- | ---- | ----------------- | ------------ |
| S4-01 | ☐      | Pure clock functions (`remaining`, `startFor`, `onMove`, `flagged`, `stop`)                                             | F16      | C    | T-C1–6            | —            |
| S4-02 | ☐      | Server clocks: start after ply 2, flag timer + grace, timeout-vs-insufficient, clock in snapshots                       | F16      | S    | T-C5, integration | S4-01, S3-02 |
| S4-03 | ☐      | Presence (`room:presence`), reconnection via token, 60 s abandon timer, both-disconnected rule                          | F9, F10  | S    | T-M8, T-P4        | S3-01        |
| S4-04 | ☐      | `sweep()`: 30 min after end, 24 h inactivity, tombstones → `ROOM_EXPIRED`                                               | F23, 5.3 | S    | T-M9              | S3-01        |
| S4-05 | ☐      | `ChessGame.toPgn` + "Download PGN" button (online and local)                                                            | F24      | C    | PGN parse test    | S2-01        |
| S4-06 | ☐      | Client clock display (interpolation from `receivedAt`, low-time style). Presets + custom in Create dialog. Local clocks | F16      | F    | unit, E3          | S4-02        |
| S4-07 | ☐      | Review after game end + "review available until hh:mm"                                                                  | F22, F23 | F    | E1                | S2-06        |
| S4-08 | ☐      | E2E E3 (reload), E4 (abandon, shortened grace via env), E5, E6                                                          | —        | Q    | E3–E6             | S4-03        |
| S4-09 | ☐      | UX: sounds (move/capture/check/end, mute), tab title by state, clear end-of-game texts                                  | 4.1      | F    | manual            | S3-05        |
| S4-10 | ☐      | PWA (vite-plugin-pwa): local mode works offline after first load                                                        | 2.3      | F    | E6 offline        | S2-03        |

## Sprint 5 — _Could_ features & verification (Dec 7 – 13)

**Goal:** extras if time allows, plus evidence that the NFRs are met. **Sync 2.**
Order inside this sprint: verification (S5-05…S5-09) **before** extras.

| ID    | Status | Task                                                                                          | Req      | Role | Tests            |
| ----- | ------ | --------------------------------------------------------------------------------------------- | -------- | ---- | ---------------- |
| S5-01 | ☐      | Chat (players + spectators, rate-limited, text-only rendering)                                | F17      | S+F  | T-P7             |
| S5-02 | ☐      | Spectator UI (read-only board, flip, spectator count)                                         | F18      | F    | E7               |
| S5-03 | ☐      | Bot ≥ 1500 Elo with Stockfish WASM in a Web Worker. **Only after ADR-010 is decided**         | F15      | C    | manual: 20 games |
| S5-04 | ☐      | Online takeback request / accept                                                              | F19      | S+F  | unit             |
| S5-05 | ☐      | Security pass: CSP header, `npm audit`, check tokens never logged, origin list for production | 5.2      | Q    | review           |
| S5-06 | ☐      | Load test `tools/loadtest`: 200 rooms × 2 clients. Report p50/p95/p99 and memory              | 5.1, 5.3 | Q    | §16.4            |
| S5-07 | ☐      | Lighthouse on the deployed app (< 3 s load)                                                   | 5.1      | Q    | report           |
| S5-08 | ☐      | Cross-browser / device matrix: Chrome, Firefox, Safari (iOS), Edge, Android                   | 2.3      | Q    | checklist        |
| S5-09 | ☐      | **Sync 2 with Team 3:** demo + acceptance checklist from SDD §17. Meeting note                | —        | all  | —                |

## Wrap-up (Dec 14 – 18)

| ID   | Status | Task                                                                                                                                                                                                                                     | Owner         |
| ---- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| W-01 | ☐      | Bug fixes only (code freeze since Dec 13). Tag `v1.0.0`                                                                                                                                                                                  | all           |
| W-02 | ☐      | Final presentation (date TBD — check course schedule)                                                                                                                                                                                    | all           |
| W-03 | ☐      | **Team report:** client experience (≥ 3 interactions, 2 meeting summaries, peer score for our developer team) + developer experience (progress, client-driven changes, every meeting, course knowledge) + repo link + team AI disclosure | Q coordinates |
| W-04 | ☐      | **Individual reports** (each member): contributions as client and developer, lessons, peer scores, personal AI disclosure                                                                                                                | each          |

---

## Parallel tracks

Who can work at the same time without blocking each other:

```
Core (C):   S2-01 → S2-02 → S2-04 ─┐      S4-01 → S4-05 → (S5-03)
Server (S):        S3-01 → S3-02 → S3-03 → S4-02 / S4-03 / S4-04 → S5-01 / S5-04
Frontend (F): S2-03 → S2-05..08 → S3-04 → S3-05 → S4-06 / S4-07 / S4-09 / S4-10 → S5-02
QA (Q):     S1-04/05 → S3-07 → S4-08 → S5-05..08 → W-03
```

- **The server track can start S3-01 during sprint 2,** against the `ChessGame` interface, as soon as S2-01 lands.
- **The frontend track can build the online UI against a fake store** before S3-01 is merged.
