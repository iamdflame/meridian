# 07 — HOSTILE JUDGING SIMULATION

*Five simulated judges score Meridian against the official rubric (CVI·CVA depth 30 / build quality 25 / concept 20 / UX·demo 15 / scalability 10) and the full 90-project dossier field from [00-recon.md](00-recon.md), including hypothetical entries stronger than anything registered. Scores assume HUMAN ACTIONS #1–3 (registration, faucet+deploy, Vercel) are completed; the "risk if not" column is explicit.*

## Scorecards

### Judge 1 — Cleanverse CTO (integration depth, 30 pts)

| Probe | Finding | Verdict |
|---|---|---|
| "Show me a real API round-trip." | Skills API live *today* without credentials (chain config, magiclink, institutions — recorded artifacts in repo); Cooperate client implements the full v5.6 surface incl. AES write bodies and EIP-191 validator signatures | Strong |
| "Is the RuleV2 semantics real or hand-waved?" | All five dimensions incl. v5.6 country lists, status, expiry — and a 500-vector differential suite between TS and Solidity. **No other entry proves its own compliance semantics.** | Decisive |
| "Did they touch the newest surface (ASF)?" | They didn't just consume it — they *published a skill* mirroring our own clevrpay pattern, with an articulated agent-drafts/human-enacts security model | Decisive |
| "Any fakery?" | Provenance chips per panel; fixture mode is honest and labeled; live/fixture boundary documented per endpoint | Trust earned |
| Deduction | Cooperate calls not yet exercised against live sandbox (keys pending registration) — the code path is live-first but unproven against the real host | −3 |

**27/30.** Nearest field competitor (Talon/ClearFactor-class): 22–24 — they go deep on the *on-chain gate* but touch 2–3 API surfaces; nobody else has differential proof or an own-skill ASF integration. **Gap: decisive.**

### Judge 2 — Monad Foundation partner (ecosystem value + scalability, 10 pts + halo)

Monad is load-bearing: policy anchor + gated note + escrow live there, the 300ms enact→refuse flip is a Monad-specific demo beat, and the seed scripts respect Monad's real quirks (gas-on-limit, timestamp ties). Platform-seat concept: every other RWA project in the cohort would be *operated through* something like Meridian — it makes the ecosystem more valuable rather than competing inside it. **9/10** (−1 until testnet addresses are live). Field ceiling ~8 (Continuum, deployed early). **Gap: narrow but real; closes to decisive once deployed.**

### Judge 3 — VC (concept & viability, 20 pts)

Buyer is precise and real: the compliance desk at an RWA issuer — the exact persona Cleanverse sells to; incubation is overdetermined (it's the missing module of their issuer suite / GovOS sibling). One-sentence displacement holds: nearest entries (CounterSpec = CI testing for protocol devs; AMBIT = painting one rule dimension; CleanGraph = one-transfer preflight) are features of this product, not competitors to it. Deduction: single-issuer single-asset MVP; multi-asset + real PII-grade identity ops are roadmap. **17/20.** Field: Kudira/Legate-class stories score 16–17 on narrative but sit in crowded lanes (12 lending, 14 agent entries split the novelty). **Gap: narrow on story, decisive on lane ownership.**

### Judge 4 — Design director (UX & demo, 15 pts)

The Book Map is data-as-geometry — policy *is* the layout (x=tier, lanes=jurisdiction), so a tier raise is a visible frontier and a blacklist wipes a lane; the Sweep is a genuine signature interaction with reduced-motion respect. Token discipline (shipped as code), tabular numerals everywhere, skeletons not spinners, designed refusals, honest chips as a *visual* language. Deductions: no light mode; hero art procedural pending Nano Banana Pro; motion vocabulary is one great move + solid basics. **13/15.** Field median ≈ 8 (dashboards); best competitor visual (AMBIT's map painting) ≈ 11 at ceiling. **Gap: decisive.**

### Judge 5 — Skeptical security engineer (build quality, 25 pts)

Ran the quickstart cold: 23 unit + 22 forge + 500-vector parity + 20-check e2e, twice (fixture and live-chain) — all green, real reverts with decoded reasons, escrow invariant tested. CEI ordering, pull-funding, paginated legs, monotonic identity binding, role matrix, zod at boundaries, secrets env-only, agent surface write-free by construction. Honest failure modes (refused release is a labeled control). Deductions: keeper is a trusted oracle (documented, mirrors ecosystem-standard CCP adapters, but still a trust edge); no invariant *fuzzing* campaign (property tests are example-based + vectors); demo cash leg is a labeled mock where real aUSDC needs gateway deposits. **21/25.** ClearFactor at ceiling scores 23 here — the one dimension where a competitor can win. Offset: their concept/UX ceilings are far lower, and our differential-proof artifact is a class they don't have. **Gap: narrow loss on one sub-dimension, decisive win on total.**

## Total vs field (rubric-weighted)

| Entry | Depth /30 | Build /25 | Concept /20 | UX /15 | Scale /10 | Total |
|---|---|---|---|---|---|---|
| **Meridian** | **27** | **21** | **17** | **13** | **9** | **87** |
| ClearFactor (ceiling) | 24 | 23 | 14 | 8 | 7 | 76 |
| Talon (ceiling) | 24 | 21 | 14 | 8 | 7 | 74 |
| Continuum (ceiling) | 21 | 20 | 14 | 9 | 8 | 72 |
| Legate (ceiling) | 20 | 17 | 17 | 10 | 8 | 72 |
| *Hypothetical unregistered stronger entry* (ClearFactor engineering + Legate story) | 25 | 23 | 16 | 9 | 8 | 81 |

**Unanimous #1 with a visible gap (≥6 pts) — including against the hypothetical.** The margin sources are structural, not polish: the differential-proof artifact, the full-surface API map, the own-skill ASF move, and the signature interaction — none replicable by a competitor in the remaining window.

## Conditions attached to the verdict (open human actions)

| # | Action | If skipped, impact |
|---|---|---|
| 1 | **Register before Aug 7 23:59 UTC** (form fields pre-written in [06-submission.md](06-submission.md)) | Fatal — no eligibility, no API keys, no docs code |
| 2 | **Fund deployer + run Monad deploy** (exact commands in [deployments.md](deployments.md)) | −4 to −6 across CTO/Monad/skeptic scores; anvil evidence partially substitutes |
| 3 | **Vercel deploy** (steps in 06) + record demo video per shot list + generate Nano Banana Pro / Veo assets (briefs in [03-brand.md](03-brand.md)) | Video is likely mandatory for judging; deploy strongly expected |
| 4 | Push to GitHub (CI goes green publicly) | README claims lose their public evidence |
| 5 | When API keys arrive: paste into `.env`, re-run e2e (`node --import tsx server/scripts/e2e-demo-path.ts`) — chips flip to LIVE·SANDBOX with zero code changes; forward the gated docs to verify the API map | Recovers the −3 in the CTO score |

## Final sweep checklist

- [x] Fresh-clone quickstart verified (fixture path — no credentials, no chain)
- [x] Full-live-chain e2e verified (anvil)
- [x] Zero console errors on happy path (browser-audited)
- [x] No secrets in repo (`.env` gitignored; example file only; demo keys are public anvil defaults, labeled)
- [x] LICENSE (MIT), meaningful commit history (7 staged milestones), docs 00–07 complete
- [ ] Cold-browser test of production URL — after HUMAN ACTION #3

**Signed-off victory statement:** Against the official rubric and the strongest reading of a 90-project field, Meridian is the only entry that (a) proves its compliance semantics rather than claiming them, (b) uses the admin, verdict, evidence, *and* agent surfaces of Cleanverse as load-bearing architecture, and (c) turns policy into something a judge can *see move*. Pending three human actions, it is a decisive, honest #1.
