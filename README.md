# 350 Chess

A web-based chess app with **online play** via invite code and **local play** on one device. No accounts, no database.
It is built for the CS350 (KAIST) team project. The client is Team 3, and the requirements come from their SRS.

> **Status:** sprint 1. The skeleton is in place (tooling, CI, server, client shell). Features are tracked in [`docs/BACKLOG.md`](docs/BACKLOG.md).

## Start here

| Read                                           | What it is                                                                                                                                                          |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`AGENTS.md`](AGENTS.md)                       | **Team knowledge base.** Course deliverables and deadlines, rules we never break, conventions, decision log, lichess research notes. Also read by AI coding agents. |
| [`docs/BACKLOG.md`](docs/BACKLOG.md)           | **Sprint plan:** every task with ID, requirement, owner role, tests and dependencies.                                                                               |
| [`docs/SDD.md`](docs/SDD.md)                   | **Software Design Document:** architecture, protocol, clock rules, testing, plan. This is the version submitted to KLMS.                                            |
| [`docs/ai-usage-log.md`](docs/ai-usage-log.md) | AI usage log, required for the final reports. Add a row whenever you use AI.                                                                                        |

## Getting started

You need **Node 24** (see `.nvmrc`) and git.

```bash
git clone https://github.com/enes-0001/chess350.git
cd chess350
npm install
npm run dev        # open http://localhost:5173
npm run check      # lint + format + typecheck + tests — run before every PR
```

More commands are in [`AGENTS.md` §6.5](AGENTS.md#65-commands).

## Repository layout

```
packages/core     pure TypeScript: rules, clock, protocol schemas, PGN (shared by server and client)
packages/server   Node + Express + Socket.IO, rooms in memory
packages/client   React + Vite + react-chessboard
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
