# 08 — FORENSIC AUTOPSY OF THE VERDICT

*Source: hackathon-judging-report.md (155 projects, read in full).*

## 1. The judge's revealed preference function

Every top-10 score decomposes into two multipliers, visible verbatim in the judge's own notes:

| Preference | Exact phrases that earned points | Who has it |
|---|---|---|
| **A *named new mechanism*** | "eligibility-projected order book", "records the refusal decision permanently", "prices credential-expiry as compliance bonds", "obligor counter-signs", "liquidation venue for transfer-restricted collateral", "per-position compliance", "multilateral netting", "identity-tiered tranching" | ALL of top 10 |
| **Execution evidence** | "deployed on Monad testnet", "60,000 property-based cases", "157 tokens indexed", "three live trades", "19/19 tests", "measured", "full lifecycle executed against real deployed contracts" | 1,2,3,4,5 |
| Real-problem framing | "tokenizing is solved, *selling* is not", "the missing exit", "why permissioned venues have no liquidity" | 1,2,7,9 |

The judge's own summary is explicit: *"a new mechanism … plus execution evidence (deployed addresses, property tests, measured data)."* And the meta-rule: **judged from registered descriptions only** — the description IS the artifact; the final panel audits repos/deployments/videos directly.

**Weight math:** Integration 30 · Innovation 25 · Problem 20 · Execution 15 · Clarity 10. The top 5 each max Innovation (a named mechanism) AND Execution (deployed + measured). We scored 8.8 with a strong Integration story but an unnamed mechanism ("console for issuers") and **addresses still `_pending_`** — the single largest unforced deduction.

## 2. Meridian's registered description — sentence audit

| Sentence | Reads as | Fix |
|---|---|---|
| "Mission control for verified-asset issuers — **Simulate → Enact → Prove**" | **Tooling.** "Mission control" = dashboard vocabulary (7.4–6.8 territory) | Lead with the named primitive; the console is the interface, not the product |
| "Differential sweep engine … before enactment" | Mechanism, unnamed | **Name it** (Phase B) |
| "differentially tested against the on-chain gate" | Evidence, no number | 500 vectors |
| "anchored in an on-chain hash chain" | Evidence, no address | deployed addresses |
| "suspended into escrow rather than lost" | Mechanism, buried | promote to the money-caught clause |
| "Solves the #1 institutional blocker" | Unverified superlative | kill or measure |

Our strongest artifacts — the **differential proof**, the **suspense escrow**, the **own published Agent Skill** — were either unnumbered or entirely invisible in the registered description.

## 3. Beat-conditions (falsifiable, one per rival)

- **Venue (9.5):** we out-prove them when `pnpm judge` shows **≥100,000 property cases** (we have 102,400, 0 failures) + the **500-vector cross-language differential parity** (they have no cross-implementation proof) + deployed addresses. *Ship: invariant campaign (done), differential suite (done), deployments (done).*
- **Plumb (9.3):** they prove what compliance *stopped* (refusal ledger). We own what it *will* do (pre-enactment). Beat them when the **blast-radius proof** is a consumable, anchored artifact any issuer requests — plus our own measured study of real chains. *Ship: named primitive + measured study.*
- **Tenor (9.2):** they price credential *decay* (bonds on forwards). We own the *pre-enactment* tense — proof before a rule exists. Beat them when the sweep is proven binding: draft verdict ≡ enacted chain verdict, differentially. *Ship: proof-before-enactment, differentially bound.*
- **Covenant (9.0):** their inversion (obligor signs first). We beat them by owning the whole policy lifecycle, not one lifecycle hop: simulate → enact → prove → distribute → recover. *Ship: full-lifecycle evidence on-chain.*
- **Pignora (8.9):** their full lifecycle on-chain. We beat them with the same plus the mechanism they don't have. *Ship: live e2e on Monad with real txids (deployed, pending re-run at gas).*

**The unifying answer:** every rival owns *one* tense or *one* hop. Meridian owns **the future tense of compliance** — what a rule *will* do, proven before it exists, anchored after it does.

## 4. Top-10 pattern table (mechanism + evidence)

| # | Project | Named mechanism | Evidence |
|---|---|---|---|
| 1 | Venue | eligibility-projected orderbook | Monad, 60k property cases, 19 tests |
| 2 | Plumb | refusal proof ledger | 157 tokens indexed, 27-vector suite, 2 chains |
| 3 | Tenor | compliance bonds (credential expiry priced) | 3 live trades on Monad |
| 4 | Covenant | obligor counter-signs debt | live, 6 contracts, 19/19 |
| 5 | Pignora | tier-haircut repo | full lifecycle on-chain, 16 tests |
| **6→** | **Meridian (us)** | **(was unnamed — now Phase B)** | **(was pending — now deployed)** |
| 7 | Recourse | liquidation venue for restricted collateral | composition pitch |
| 8 | Mezzanine | tiered tranching / waterfall | mechanism |
| 9 | STRATA | per-position compliance in shared pools | mechanism |
| 10 | NetClear | multilateral netting | mechanism |

We were the only top-10 entry with **no named mechanism and no deployed addresses.** Both are now closed.
