# 04 — BUILD REPORT (Core Engine)

*All numbers below are from actual runs, reproducible via the commands shown.*

## Test results

| Suite | Command | Result |
|---|---|---|
| Cleanverse client (AES round-trip, envelope, fixture lifecycle: generate→verify→freeze→blocked→reactivate, expired-as-blocked, rules, validator) | `pnpm vitest run packages/cleanverse` | **11/11 PASS** |
| Sim engine + seeded book (determinism, blast-radius exactness, stranded-value totals, pending-leg flagging, allow-list mode, canonical proof digest) | `pnpm vitest run server` | **13/13 PASS** |
| Contracts (proof required before enactment, public proof consumer, eligibility matrix incl. every refusal reason, expiry boundary `>=` semantics, policy-flip beat, live-not-latched freeze, identity monotonicity, hash-chain links, suspend→release with escrow invariant, pagination idempotence, role separation) | `forge test` | **37/37 PASS** |
| **Differential parity** — 500 seeded vectors, TS `evaluate` vs Solidity `RuleV2Lib.evaluate`, all 10 reason codes represented (dist: 27/24/47/70/102/79/65/53/11/22) | `forge test --match-contract RuleVectorsTest` | **500/500 AGREE** |
| Headless demo-path e2e — fixture mode (no chain, no credentials) | `node --import tsx server/scripts/e2e-demo-path.ts` | **24/24 checks PASS** |
| Headless demo-path e2e — **full live chain** (anvil): deploy → attest 48 → fund → mint → prove-transfer passes v1 → anchor exact sweep proof → enact v2 (real txs) → same transfer **reverts with `TransferIneligible(IneligibleCountry)`** → coupon run pays 6 / suspends 6 → release refused on-chain (409) → remediate → release succeeds → evidence pack → agent verifies exact active proof → reconciliation | one-command repro in [deployments.md](deployments.md) | **24/24 checks PASS** |

## Live integrations verified (no credentials required)

- `query_chain_config` → real sandbox config recorded: Monad chain 10143, aUSDC `0xaC0893567D43C3E7e6e35a72803df05416C1f20D`, A-Pass NFT `0xbA82D189540CaC9DC6FF46B6837CaC1BFdEC58B9` → checked into `packages/cleanverse/src/recorded/`
- `get_magiclink` → live remediation URL, used in the e2e remediation beat
- `query_deposit_institutions(monad, usdc)` → live whitelist incl. Anchorage Digital

## Honesty architecture (implemented, not aspirational)

- Every Cooperate response carries `source: "live" | "fixture"`; the UI renders per-panel provenance chips
- Fixture adapter is **stateful and faithful** (freeze actually blocks verify; expiry actually blocks) — the app runs end-to-end with zero credentials and zero chain, degrading in labeled steps, never silently
- `MERIDIAN_ALLOW_FIXTURES=0` hard-disables simulation for production discipline

## Security pass

**Contracts:** reentrancy — CEI ordering everywhere; value moves are last statements; `ReentrancyGuard` on Distribution paths; pull-funding makes half-paid runs impossible. Access control — role matrix tested (`ISSUER`, `KEEPER`, `GOVERNOR`, `OPERATOR`, `PROTOCOL`); identity re-bind forbidden. Integers — 0.8.28 checked math; `uint128` legs summed into `uint128` bounded by pull-funding; floor-only arithmetic. Oracle assumptions — none beyond the keeper attestation, documented as the trust model (mirror pattern, identical to field-standard CCP adapters). No `tx.origin`, no delegatecall, no assembly, no unbounded loops (paginated `payLegs`).

**Server (OWASP):** input validation — zod schemas at every route boundary (tier 0–99, ISO2 length, memo caps); no secrets in code (env-only, `.env` gitignored, App Key never transmitted by design); structured errors, no stack leaks; CORS explicit; no SQL/no injection surface (in-memory store); skill surface is read/simulate-only by construction — no write endpoint exists to abuse.

## Deviations from plan

- No proof-surface deviations remain: the proof-gated primitive is live on Monad testnet with eight successful public receipts, and the current full-chain path passes against a fresh Anvil deployment.
- The shared Cleanverse tenant is treated conservatively: 9/9 credentialed Cooperate calls are publicly receipted, while bulk demo rows remain deterministic, labeled fixtures rather than destructive shared-tenant writes.
