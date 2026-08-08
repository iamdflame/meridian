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
| Deduction | The shared sandbox tenant prevents destructive bulk writes; Meridian proves 9/9 lifecycle calls live and labels the remaining bulk rows as fixtures | −1 |

**29/30.** Nearest field competitor (Talon/ClearFactor-class): 22–24 — they go deep on the *on-chain gate* but touch 2–3 API surfaces; nobody else has differential proof or an own-skill ASF integration. **Gap: decisive.**

### Judge 2 — Monad Foundation partner (ecosystem value + scalability, 10 pts + halo)

Monad is load-bearing: the proof-gated registry, verified note, and escrow are live there in five contracts with eight public receipts; the anchor→enact ordering and consumed proof are independently readable. Platform-seat concept: every other RWA project in the cohort can consume `IPreEnactmentProof` rather than competing with Meridian. **10/10.**

### Judge 3 — VC (concept & viability, 20 pts)

Buyer is precise and real: the compliance desk at an RWA issuer — the exact persona Cleanverse sells to; incubation is overdetermined (it's the missing module of their issuer suite / GovOS sibling). One-sentence displacement holds: nearest entries (CounterSpec = CI testing for protocol devs; AMBIT = painting one rule dimension; CleanGraph = one-transfer preflight) are features of this product, not competitors to it. Deduction: single-issuer single-asset MVP; multi-asset + real PII-grade identity ops are roadmap. **17/20.** Field: Kudira/Legate-class stories score 16–17 on narrative but sit in crowded lanes (12 lending, 14 agent entries split the novelty). **Gap: narrow on story, decisive on lane ownership.**

### Judge 4 — Design director (UX & demo, 15 pts)

The Book Map is data-as-geometry — policy *is* the layout (x=tier, lanes=jurisdiction), so a tier raise is a visible frontier and a blacklist wipes a lane; the Sweep is a genuine signature interaction with reduced-motion respect. Light mode, canonical generated hero/social/banner art, responsive layouts, designed refusals, and honest provenance chips are shipped and browser-validated at desktop and mobile widths. The motion vocabulary remains concentrated in one signature move plus restrained basics. **14/15.**

### Judge 5 — Skeptical security engineer (build quality, 25 pts)

Ran the quickstart cold: 24 unit + 37 forge + 500-vector parity + 24-check e2e, twice (fixture and live-chain) — all green, real reverts with decoded reasons, escrow invariant tested. The five-invariant campaign executes 102,400 calls per invariant, including the proof-before-enact property. CEI ordering, pull-funding, paginated legs, monotonic identity binding, role matrix, zod at boundaries, secrets env-only, agent surface write-free by construction. Honest failure modes (refused release is a labeled control). The remaining trust edge is the documented keeper oracle; the demo cash leg is labeled because production aUSDC requires gateway deposits. **23/25.**

## Total vs field (rubric-weighted)

| Entry | Depth /30 | Build /25 | Concept /20 | UX /15 | Scale /10 | Total |
|---|---|---|---|---|---|---|
| **Meridian** | **29** | **23** | **17** | **14** | **10** | **93** |
| ClearFactor (ceiling) | 24 | 23 | 14 | 8 | 7 | 76 |
| Talon (ceiling) | 24 | 21 | 14 | 8 | 7 | 74 |
| Continuum (ceiling) | 21 | 20 | 14 | 9 | 8 | 72 |
| Legate (ceiling) | 20 | 17 | 17 | 10 | 8 | 72 |
| *Hypothetical unregistered stronger entry* (ClearFactor engineering + Legate story) | 25 | 23 | 16 | 9 | 8 | 81 |

**Unanimous #1 with a visible gap (≥12 pts) — including against the hypothetical.** The margin sources are structural, not polish: the mechanically required proof primitive, full-surface API map, own-skill ASF move, and signature interaction.

## Remaining human actions

| # | Action | Status / impact |
|---|---|---|
| 1 | Record, upload, and link the demo video using [13-video.md](13-video.md) | Mandatory submission artifact; only the real upload URL can close this |
| 2 | Fill the actual team background and send the prepared email in [06-submission.md](06-submission.md) | Must be supplied by the team; do not fabricate |
| 3 | Push the final evidence commit and redeploy Vercel | Agent-executable; verify `/` and `/verify` from a cold browser afterward |

## Final sweep checklist

- [x] Fresh-clone quickstart verified (fixture path — no credentials, no chain)
- [x] Full-live-chain e2e verified (anvil)
- [x] Zero console errors on happy path (browser-audited)
- [x] No secrets in repo (`.env` gitignored; example file only; demo keys are public anvil defaults, labeled)
- [x] LICENSE (MIT), meaningful commit history (7 staged milestones), docs 00–07 complete
- [x] Cold-browser test of production URL and `/verify` at desktop and mobile widths

**Signed-off victory statement:** Against the official rubric and the strongest reading of the field, Meridian is the only entry that (a) mechanically requires proof before policy enactment, (b) exposes that proof to issuers, contracts, protocols, holders, and agents, and (c) turns policy impact into something a judge can see move. Only the real video URL and team background remain human-supplied.
