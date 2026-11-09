# 350 Chess

A web-based chess app with **online play** via invite code and **local play** on one device. No accounts, no database.
It is built for the CS350 (KAIST) team project. The client is Team 3, and the requirements come from their SRS.

> Status: **design phase** — no code yet. The repository skeleton comes next.

## Start here

| Read | What it is |
|---|---|
| [`AGENTS.md`](AGENTS.md) | **Team knowledge base.** Course deliverables and deadlines, rules we never break, conventions, decision log, lichess research notes. Also read by AI coding agents. |
| [`docs/SDD.md`](docs/SDD.md) | **Software Design Document:** architecture, protocol, clock rules, testing, plan. This is the version submitted to KLMS. |
| [`docs/ai-usage-log.md`](docs/ai-usage-log.md) | AI usage log, required for the final reports. Add a row whenever you use AI. |

## Key dates

- **Sync 1 with the client:** week of Nov 9, 2026 (date TBD)
- **Sync 2 with the client:** week of Dec 7, 2026 (date TBD)
- **Final reports due:** **Dec 18, 2026 18:00**, on KLMS

## Planned stack

TypeScript monorepo:

- `packages/core`: rules (chess.js), clock and protocol
- `packages/server`: Node + Socket.IO
- `packages/client`: React + Vite + react-chessboard

Details are in SDD §4–§5.
