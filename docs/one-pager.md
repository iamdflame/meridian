# MERIDIAN — Compliance that can see

**Team:** Uniq Minds · **Track:** RWA · **Chain:** Monad testnet (10143) · **Repo:** github.com/iamdflame/meridian

## Problem

Jurisdiction and eligibility rules are the #1 institutional blocker for tokenized RWAs. On Cleanverse, policy is *executable* — RuleV2 lives inside the asset — but issuers still enact rule changes **blind**: nothing shows what a rule will do before it becomes law, and nothing proves exactly what it did afterwards.

## Solution — the issuer's operating console, in three verbs

**SIMULATE.** A differential sweep evaluates every holder and every pending coupon leg under a draft rule — all five RuleV2 dimensions (group, sub-group, min tier, min sub-tier, v5.6 country allow/deny) plus credential status and expiry — and shows precisely who strands, what value freezes, and which payments would fail, before signing.

**ENACT.** One signed call writes the rule through the Cleanverse API, anchors the policy version in an on-chain hash chain, and flips live transfer behavior at the token layer: the same transfer that settled a moment ago is refused with the exact rule that blocked it.

**PROVE.** An exportable evidence pack — policy hash chain, affected-holder ledger, Travel Rule references per settlement — verifiable hash-by-hash from public state. Stranded coupon legs suspend into on-chain escrow (*money caught, not lost*) and release only when eligibility is re-proven on-chain.

## CVI · CVA integration points (verified live against the sandbox)

- **CVI:** `generate_apass` (v5.5 country tags from `issuingCountryISO2`), `query_apass`, `query_apass_list` (paginated), `verify_apass` (incl. normalizing the sandbox's `APassNotActive` envelope for frozen credentials), `update_status` freeze/reactivate as an enactable lever, `get_magiclink` for holder remediation. Live smoke: **9/9 green**; 11 real A-Pass records power the demo book.
- **CVA:** A-Token RuleV2 administration (`atoken/add_rule` / `rules`) with issuance-stage policy on our own asset; the shared sandbox aUSDC is used **read-only** by design (shared tenant discipline).
- **CCP:** the five-dimensional rule semantics implemented twice — TypeScript simulator and Solidity transfer gate — with **500 differential vectors executed by both suites in CI**; validator pool registration path implemented (EIP-191 owner signature).
- **Travel Rule:** `download_travel_rule` per settled leg, embedded in the evidence pack.
- **Agent Skill Framework:** Meridian publishes its own skill (the official clevrpay pattern) — agents query and simulate the blast radius; the agent surface has **no write endpoint**, so enactment stays human-signed.

## Deployed chains & demo

Monad testnet: `EligibilityRegistry` (attested A-Pass mirror), `PolicyRegistry` (hash-chain anchor), `VerifiedAssetToken` (live-read gate, legible refusal reasons), `DistributionEngine` (suspense escrow) — addresses in `docs/deployments.md`. Console (Next.js) on Vercel with per-panel provenance chips: LIVE·SANDBOX / LIVE·MONAD / SIMULATED — honesty is architectural.

## Evidence

23 unit tests · 22 Foundry tests · 500/500 TS↔Solidity differential vectors · 20/20 e2e demo-path checks (fixture **and** live-chain modes) · 9/9 live Cooperate API smoke · zero console errors on the happy path. Reproduce from a fresh clone with zero credentials: `pnpm install && pnpm vitest run && node --import tsx server/scripts/e2e-demo-path.ts`.
