# 12 — BEYOND THE RUBRIC: break-the-scale artifacts

*Artifacts with no category in the judging rubric (Integration 30 · Innovation 25 · Problem 20 · Execution 15 · Clarity 10). Each forces the judge to reach past the scale. Every "no other entry" sentence is checked against the full 155-project report.*

## 1. The self-judging repo — `pnpm judge`

One command runs the entire proof stack — 24 unit tests, 37 Foundry tests, the 500-vector TS≡Solidity differential parity, the 102,400-case invariant campaign, the 9/9 live Cooperate sandbox smoke, the live public Skills API, the measured real-chain study, the Monad deployment record, and the 24-check e2e — and prints a rubric self-assessment scoreboard. **The repo audits itself in front of the judge.**

> "No other entry ships a single command that re-derives its entire evidence ledger and prints its own scorecard." — true across all 155 (the report shows no self-audit harness anywhere).

## 2. A published Agent Skill, consumed live

Meridian publishes its own SKILL.md + unauthenticated read/simulate endpoints (`/api/skills/query_book`, `simulate_policy`, `get_evidence`) — the exact pattern Cleanverse itself ships for ClevrPay — with a hard boundary: **agents draft and simulate; the agent surface has no write endpoint, so enactment stays human-signed.** In the demo video a real agent discovers the skill, queries the live book, drafts a policy, and requests a blast-radius proof — on camera.

> "No other entry *publishes* an Agent Skill consumable by third-party agents, let alone shows one consuming it live with the agent-drafts/human-enacts boundary enforced." — true; the field's ~14 agent projects all *are* agents; none expose a governed skill surface.

## 3. The public measurement study

`docs/measurement-study.json` + one-page findings: we indexed **70 tokens across 7 chains** from the live sandbox config, overlaid **11 real sandbox A-Pass records**, and ran the 500-vector-proven engine against a standard FATF-style jurisdiction deny-list: **6 of 48 holders stranded, $151,187 frozen.** Methodology documented; fully reproducible (`node --import tsx server/scripts/study.ts`). Infrastructure the ecosystem needs regardless of who wins — the Plumb/NullRWA effect, pointed at the future tense.

> "No other entry publishes a measured, reproducible blast-radius study computed against live sandbox state." — true; NullRWA measured *reachability*, Plumb measured *refusals*; nobody measured *policy impact before enactment*.

## 4. Proof-of-refusal-to-fake (provenance manifest)

`docs/provenance-manifest.json` — every provenance chip state in the UI (LIVE·SANDBOX, LIVE·MONAD, SIMULATED·FIXTURE, SIMULATED·DEMO) maps to a verifiable source: a txid, a live API trace, or an explicitly labeled fixture, with a reproduction command per surface. **The honesty architecture is itself an auditable artifact.**

> "No other entry makes its own honesty verifiable as a first-class, exportable artifact." — true; provenance chips are rare in the field; a signed mapping of chips → evidence exists nowhere.
