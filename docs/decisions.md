# Decisions Log

| # | Decision | Rationale | Date |
|---|---|---|---|
| D-1 | Track = **RWA**; chain = **Monad testnet (10143)** | Track text matches concept verbatim; Monad Foundation judging presence; first-class Cleanverse chain (aUSDC); 300ms blocks make the enact→flip beat instant | 08-07 |
| D-2 | Concept = **Meridian** (issuer mission control: simulate → enact → prove) | Won 10-concept matrix 8.55/10; passes Unfair/Ecosystem/Business/Story tests vs ~90-project field (docs/01) | 08-07 |
| D-3 | Server-signed demo transactions (deployer key), no wallet-connect | Fewer live failure modes on stage; judges evaluate flows, not MetaMask; documented honestly | 08-07 |
| D-4 | Fixture adapter with visible per-panel provenance chips (`LIVE·SANDBOX` / `LIVE·MONAD` / `SIMULATED·FIXTURE`) | Honesty is scored; sandbox flakiness documented in field intel; degradation must never look like fakery | 08-07 |
| D-5 | Rule struct defined once, generated into TS + Solidity | Prevents sim/contract semantic drift (top-5 risk) | 08-07 |
| D-6 | Meridian publishes its own Agent Skill (SKILL.md + no-auth read endpoints); agents draft, never enact | Mirrors Cleanverse's own clevrpay pattern — deepest honest ASF integration available without gated ASF docs | 08-07 |
| D-7 | In-memory + JSON-snapshot data layer (no database) | 48h scope discipline; book is rebuildable from chain + API; zero infra failure modes on demo day | 08-07 |
| D-8 | pnpm workspaces; Node 22; Solidity 0.8.28 pinned; Next 15 + Tailwind 4 pinned | Field intel: 0.8.26 custom-error trap; unpinned `latest` drifted majors | 08-07 |
