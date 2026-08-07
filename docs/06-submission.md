# 06 — SUBMISSION PACKAGE

## Final submission copy (paste-ready)

**Project name:** Meridian
**Track:** RWA
**One-liner:** Mission control for verified-asset issuers — simulate any compliance-policy change against the live book, see the exact blast radius, enact it with one signed call, and export the proof.

**Project description (form field):**
> Every compliance policy an issuer enacts today is enacted blind: legal writes a memo, ops updates a spreadsheet, and the desk discovers the blast radius as a breach report weeks later. On Cleanverse, policy is executable (RuleV2) — but nothing tells an issuer what a rule will do *before* it becomes law, or proves *exactly what it did* afterwards.
>
> Meridian is the operating console for that gap. It holds the issuer's entire book live — every holder's A-Pass state (tier, group, jurisdiction, expiry, freeze) and position. Draft a policy change — a country blacklist, a tier raise — and Meridian sweeps the full book through the exact five-dimensional RuleV2 semantics and shows precisely who strands, what value freezes, and which pending coupons would fail. Enact it and the rule writes through the real Cleanverse API (`atoken/set_rule`), anchors in an on-chain hash chain on Monad, and flips live transfer behavior at the token layer — the same transfer that settled a second ago now refuses with the exact rule that blocked it. Distribution legs that strand mid-flight suspend into escrow ("money caught, not lost"), releasable only when the chain re-proves eligibility. One click exports the evidence pack a regulator can verify hash-by-hash.
>
> Cleanverse is load-bearing across six surfaces: CVI is the book (generate/query/verify/freeze + magiclink remediation), CVA rule administration is the enactment lever, CCP semantics are the verdict layer (proven by a 500-vector differential suite where the TypeScript simulator and the Solidity gate never disagree), Travel Rule reports ride the evidence pack, and Meridian publishes its own Agent Skill — the pattern Cleanverse itself uses for ClevrPay — so agents can query and simulate but never enact. Honesty is architectural: every panel carries a LIVE·SANDBOX / LIVE·MONAD / SIMULATED provenance chip.

**Cleanverse integration plan (form field):**
> Already integrated: Skills API live (chain config, magiclink, institutions); Cooperate v5.6 client with AES write-body helper for A-Pass lifecycle, A-Token rules, validator pools, Travel Rule (live where sandbox credentials permit, faithful labeled fixtures otherwise); on-chain policy gate + suspense escrow on Monad. Post-hackathon: register DistributionEngine as a validator compliance pool (registerV2), full country-dimension coverage, and pilot with one RWA issuer's compliance desk — Meridian is the module between Cleanverse's raw API and the institutions it sells to.

**Team background:** — *fill per your actual team* —

## Demo video: script + shot list (≤3:00)

| t | Shot | Source | VO (word-for-word) |
|---|---|---|---|
| 0:00–0:08 | Veo clip `media/veo-act1.mp4`: chart table, memos dissolve, meridian line ignites | Veo 3.1 | "March 2024. A tokenized fund discovers six percent of its holders became sanctions-exposed… four weeks ago. Compliance was enacted blind." |
| 0:08–0:25 | Screen: `/console` Book — stats tick in, map breathes; hover two holders; click one, drawer opens | Recording | "This is Meridian. The issuer's entire book — every credential, tier, jurisdiction, expiry — evaluated live against policy. This is your asset. Alive." |
| 0:25–0:45 | Screen: `/console/studio` — drag tier slider to 30, toggle KP and IR on deny list | Recording | "A sanctions update lands on your desk: blacklist two jurisdictions, raise the verification floor. Before Meridian, you'd sign this blind." |
| 0:45–1:05 | **The Sweep** — click Run sweep; wavefront crosses; nodes flip; counters settle | Recording | "Instead: sweep. Twelve hundred evaluations later — thirteen holders strand, three hundred seventy thousand dollars loses transferability, six Friday coupons would fail. You know the blast radius before it's law." |
| 1:05–1:30 | Click Enact — proof panel: 'before · transfer settled' then 'after · Jurisdiction not permitted' with LIVE·MONAD chip; version hash pill | Recording | "Enact. The rule writes through Cleanverse's real API. The version anchors on Monad in three hundred milliseconds. And watch — the same transfer that settled under v1 is now refused by the token contract itself. Not the UI. The chain." |
| 1:30–1:55 | `/console/distributions` — Execute run: 6 pay, 6 suspend with reasons; click Release on one → refused (red); Remediate → magiclink flash → Release → released | Recording | "Mid-flight money doesn't fail — it's caught. Stranded coupons suspend into escrow with the exact reason. Release is refused until the holder re-verifies — through Cleanverse's own magiclink — then the chain re-proves eligibility and pays. Money caught, not lost." |
| 1:55–2:20 | `/console/evidence` — v2 pack: rule JSON, hash pills, affected holders, audit trail; click Download | Recording | "Every claim in this demo is in the evidence pack: the policy hash chain, the affected holders, every settlement's Travel Rule reference. A regulator doesn't trust Meridian — they recompute it." |
| 2:20–2:40 | `/console/agent` — Run agent scenario; transcript streams; ends on "requires your signature" | Recording | "And the future seat: Meridian ships its own Agent Skill — the same pattern Cleanverse uses for ClevrPay. Agents query. Agents simulate. Only a human signs." |
| 2:40–2:55 | Veo clip `media/veo-act3.mp4`: pull-back to planetary node grid | Veo 3.1 | "Cleanverse made compliance executable. Meridian makes it visible — for every issuer, every asset, every rule. Compliance that can see." |
| 2:55–3:00 | Logo + links card | Still | (silence) |

**Recording notes:** 1440×900 browser, dark room profile, cursor smoothing on, 60fps; do the sweep take twice and keep the one where counters settle in sync with VO.

## Submission checklist

| Item | Status |
|---|---|
| Registration (before Aug 7 23:59 UTC) | ☐ HUMAN ACTION #1 |
| Repo public, README weaponized | ☐ (Phase 6 final sweep) |
| Deployed frontend (Vercel) cold-browser | ☐ HUMAN ACTION #3 (vercel deploy — needs account) |
| Contracts on Monad testnet + addresses in docs | ☐ blocked on HUMAN ACTION #2 (faucet) |
| Demo video ≤3min uploaded + linked | ☐ human records per shot list |
| Icon 512×512 | ☐ export logo SVG → PNG |
| Evidence: tests green in CI | ☐ push to GitHub → Actions |

## HUMAN ACTION #3 — Vercel deploy (exact steps)

```bash
# from repo root, with Vercel CLI logged in:
cd web && npx vercel --prod
# project settings → Root Directory: web
# env (optional, for full-stack demo): MERIDIAN_SERVER=<public server URL>
# without it the app runs in standalone demo mode with honest SIMULATED·DEMO chips — by design
```
