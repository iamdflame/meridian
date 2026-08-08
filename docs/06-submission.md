# 06 — SUBMISSION PACKAGE

## Submission channel (from registration email — verbatim requirements)

- **Team name (registered):** Uniq Minds · **Project:** Meridian · **Track:** RWA (requires BOTH CVI and CVA in core flow from issuance — we exceed this)
- **Deadline:** Aug 9, 23:59 UTC · **Submit via email:** isaac@cleanverse.com
- **Must include:** (1) public GitHub repo — *commit history during Aug 8–9 UTC required*; permitted pre-work is preserved and the exact boundary plus in-window history is public in [`hacking-window.md`](hacking-window.md); (2) demo video (no time limit); (3) one-page summary (below); (4) live demo URL / testnet deployment
- **Prize target:** 5,000 aUSDC (RWA 1st)

## Submission email (paste-ready — send Aug 9)

> **Subject:** Submission — Meridian (Uniq Minds) — RWA Track
>
> Hi Isaac,
>
> Submitting **Meridian** for the RWA track — mission control for verified-asset issuers: simulate any compliance-policy change against the live holder book, see the exact blast radius, enact it through Cleanverse with one signed call, and export a regulator-verifiable evidence pack.
>
> • Repo: https://github.com/iamdflame/meridian · Window ledger: https://github.com/iamdflame/meridian/blob/main/docs/hacking-window.md
> • Demo video: [LINK]
> • Live demo: [VERCEL URL] · Contracts on Monad testnet: see docs/deployments.md (addresses + explorer links)
> • One-page summary: attached (also docs/one-pager.md in repo)
>
> Quick verification for reviewers: `pnpm install && pnpm vitest run && node --import tsx server/scripts/e2e-demo-path.ts` runs the full demo path with zero credentials; with sandbox keys in .env, `server/scripts/smoke-cooperate-live.ts` passes 9/9 against the live Cooperate API.
>
> — Uniq Minds

## One-page summary (required attachment)

**MERIDIAN — Compliance that can see** · Uniq Minds · RWA Track · Monad testnet

**Problem.** Jurisdiction and eligibility rules are the #1 institutional blocker for tokenized RWAs. On Cleanverse, policy is executable (RuleV2 lives inside the asset) — but issuers still enact rule changes blind: nothing shows what a rule will do before it is law, or proves what it did afterwards.

**Solution.** The issuer's operating console in three verbs. *Simulate*: a differential sweep evaluates every holder and pending coupon leg under a draft rule (all five RuleV2 dimensions incl. v5.6 country lists + status/expiry) — who strands, what value freezes, which payments fail. *Enact*: one signed call writes the rule via the Cleanverse API, anchors the version in an on-chain hash chain, and flips live transfer behavior at the token layer. *Prove*: an exportable evidence pack — policy hash chain, affected holders, Travel Rule references — verifiable hash-by-hash. Stranded coupon legs suspend into on-chain escrow (money caught, not lost) and release only when eligibility is re-proven.

**CVI·CVA integration points.** CVI: `generate_apass` (v5.5 country tags), `query_apass`, `query_apass_list` (paginated), `verify_apass` (live reconciliation incl. APassNotActive normalization), `update_status` freeze/reactivate, `get_magiclink` remediation — all verified against the live sandbox (9/9 smoke). CVA: A-Token RuleV2 administration (`atoken/add_rule`/`rules`), issuance-stage policy on our own asset; the shared sandbox aUSDC is used read-only by design (shared tenant). CCP: five-dimensional rule semantics implemented twice (TS + Solidity) with 500-vector differential parity in CI; validator registration path implemented (EIP-191). Travel Rule: `download_travel_rule` per settled leg into the evidence pack. Plus: Meridian publishes its own **Agent Skill** (Cleanverse's clevrpay pattern) — agents query/simulate, humans enact.

**Deployed chains.** Monad testnet (10143): EligibilityRegistry, PolicyRegistry (hash-chain anchor), VerifiedAssetToken (live-read gate), DistributionEngine (suspense escrow) — addresses in docs/deployments.md. Web console on Vercel; server with honest per-panel provenance (LIVE·SANDBOX / LIVE·MONAD / SIMULATED).

**Evidence.** 23 unit + 22 Foundry tests · 500/500 differential vectors · 20/20 e2e checks (fixture AND live-chain) · 9/9 live Cooperate smoke · zero console errors.

**Project description (form field):**
> Every compliance policy an issuer enacts today is enacted blind: legal writes a memo, ops updates a spreadsheet, and the desk discovers the blast radius as a breach report weeks later. On Cleanverse, policy is executable (RuleV2) — but nothing tells an issuer what a rule will do *before* it becomes law, or proves *exactly what it did* afterwards.
>
> Meridian is the operating console for that gap. It holds the issuer's entire book live — every holder's A-Pass state (tier, group, jurisdiction, expiry, freeze) and position. Draft a policy change — a country blacklist, a tier raise — and Meridian sweeps the full book through the exact five-dimensional RuleV2 semantics and shows precisely who strands, what value freezes, and which pending coupons would fail. Enact it and the rule writes through the real Cleanverse API (`atoken/set_rule`), anchors in an on-chain hash chain on Monad, and flips live transfer behavior at the token layer — the same transfer that settled a second ago now refuses with the exact rule that blocked it. Distribution legs that strand mid-flight suspend into escrow ("money caught, not lost"), releasable only when the chain re-proves eligibility. One click exports the evidence pack a regulator can verify hash-by-hash.
>
> Cleanverse is load-bearing across six surfaces: CVI is the book (generate/query/verify/freeze + magiclink remediation), CVA rule administration is the enactment lever, CCP semantics are the verdict layer (proven by a 500-vector differential suite where the TypeScript simulator and the Solidity gate never disagree), Travel Rule reports ride the evidence pack, and Meridian publishes its own Agent Skill — the pattern Cleanverse itself uses for ClevrPay — so agents can query and simulate but never enact. Honesty is architectural: every panel carries a LIVE·SANDBOX / LIVE·MONAD / SIMULATED provenance chip.

**Cleanverse integration plan (form field):**
> Already integrated: Skills API live (chain config, magiclink, institutions); Cooperate v5.6 client with AES write-body helper for A-Pass lifecycle, A-Token rules, validator pools, Travel Rule (live where sandbox credentials permit, faithful labeled fixtures otherwise); on-chain policy gate + suspense escrow on Monad. Post-hackathon: register DistributionEngine as a validator compliance pool (registerV2), full country-dimension coverage, and pilot with one RWA issuer's compliance desk — Meridian is the module between Cleanverse's raw API and the institutions it sells to.

**Team background:** — *fill per your actual team* —

## Demo video — full production script

**Format:** 1440×900 browser, dark OS theme, cursor smoothing ON, 60fps screen recording. Voice: ElevenLabs — recommended voice profile: calm male/neutral "documentary" register (e.g. *Daniel* or *Brian*), stability 55, similarity 80, style 25, speed 0.98. Record VO per numbered line as separate clips for easy alignment. Target runtime ≈ 3:20 (no hard limit per rules — do NOT pad).

**Pre-record setup (10 min):**
1. `.env` loaded with sandbox keys + `DEPLOYER_KEY`; contracts deployed to Monad (runbook in deployments.md); run `node --import tsx server/scripts/sync-live-holders.ts` once.
2. Start server (`node --import tsx server/src/index.ts`) — verify boot line says `cooperate=LIVE chain=LIVE`.
3. Start web (`cd web && pnpm dev`), open http://localhost:3000 in a clean browser profile (no extensions, no bookmarks bar).
4. Second monitor/window: a terminal with big font (16pt+), dark theme, cleared.

| # | t | Screen action (exact) | ElevenLabs VO (word-for-word) | Direction |
|---|---|---|---|---|
| 1 | 0:00–0:08 | Veo clip `media/veo-act1.mp4` (brief in 03-brand.md) — or fallback: black frame, slow fade-in of the landing hero | "March, twenty twenty-four. A tokenized fund discovers that six percent of its holders became sanctions-exposed… four weeks ago. Nobody saw it happen — because compliance was enacted blind." | Low, deliberate. Pause after "four weeks ago." |
| 2 | 0:08–0:22 | Landing page. Slow scroll from hero to the three acts. Stop on "Sweep, then sign." | "This is Meridian — mission control for verified-asset issuers on Cleanverse. See your book. Sweep a draft policy. Sign it into law. And prove it." | Brand-voice: precise, calm. |
| 3 | 0:22–0:40 | Click **Open console**. The Book loads: stats tick in, map breathes. Hover two nodes slowly (one green SG, one amber). Click **Amara Iyer** — drawer opens. Point cursor at the LIVE·SANDBOX chip for one second. | "The Book. Forty-eight verified holders — every A-Pass tier, jurisdiction, expiry, and position, plotted in policy space. These aren't mock rows: the first twelve credentials are live records on the Cleanverse sandbox, created through generate underscore apass — and every panel names its source. Live means live. Simulated means labeled." | Emphasize "Live means live." |
| 4 | 0:40–0:52 | In the drawer click **Freeze credential**. Verdict chip flips to amber "Credential frozen". Click **Reactivate**. Chip returns green. | "Credential state is an enactable lever. Freeze — that's a real update underscore status call — and the gate refuses her instantly. Reactivate — she's back. Never latched, always live." | Match VO timing to the two clicks. |
| 5 | 0:52–1:10 | Navigate to **Policy Studio**. Drag tier slider 10→30 slowly (frontier line moves across the map). Click **KP**, then **IR** on the deny list. | "A sanctions update lands on your desk: blacklist two jurisdictions, raise the verification floor to tier thirty. Before Meridian, you'd sign this blind and find out in a breach report. Watch the frontier instead." | Let the slider drag breathe — the line IS the policy. |
| 6 | 1:10–1:28 | Click **Run sweep**. THE SIGNATURE SHOT: wavefront crosses, nodes flip, counters settle. Hold 2s after settle. Mouse to "Value stranded" card. | "Sweep. Forty-eight holders and every pending coupon, re-evaluated under the exact five-dimensional rule semantics the chain enforces. Three holders strand. Seventy thousand dollars loses transferability. Three Friday coupons would fail. You know the blast radius — before it's law." | This is the money shot; do 2–3 takes. Numbers in VO must match screen — re-record if seed differs. |
| 7 | 1:28–1:36 | Scroll blast-radius table. Hover the stranded KP row. | "And not as an abstraction — as names, wallets, and dollar amounts. This is what your regulator will ask about." | Quiet. |
| 8 | 1:36–1:58 | Click **Enact as v2**. Proof panel animates: "before · transfer settled" (green) → "after · Jurisdiction not permitted" (red) with LIVE·MONAD chip. Then the version hash pill appears; click it (copy flash). | "Enact. The rule writes through Cleanverse's API. The version anchors on Monad — three hundred millisecond blocks — and here is the proof that this is real: Meridian sends the same transfer twice. Before the policy — it settles, transaction hash on screen. After — refused. Not by our UI. By the token contract itself, with the exact rule that blocked it." | Pause between "Before…" and "After…" to sync with the two chips. |
| 9 | 1:58–2:20 | Navigate to **Distributions**. Click **Execute run**. Table resolves: paid rows green, two suspended amber with reasons. Click **Release** on a suspended leg → red refusal appears. Then **Remediate** → **Release** → row flips to released; escrow stat drops to zero for that leg. | "Mid-flight money doesn't fail — it's caught. The coupon run pays ten legs and suspends two into on-chain escrow, each with its reason. Release is refused — on-chain — until the holder re-verifies through Cleanverse's own magic-link flow. Then the chain re-proves eligibility… and pays. Money caught. Not lost." | The refusal is a FEATURE — VO must sound satisfied, not apologetic. |
| 10 | 2:20–2:38 | Navigate to **Evidence**. Click **v2** tab. Slow scroll: rule JSON → anchor hash pills → affected holders → audit trail. Click **Download pack**. | "Everything you just watched is in the evidence pack. The policy hash chain — recompute it from public state. The affected-holder ledger. Travel Rule references on every settlement. A regulator doesn't trust Meridian. They verify it." | Metronomic pacing over the scroll. |
| 11 | 2:38–2:56 | Navigate to **Agent Surface**. Click **Run agent scenario**. Let the transcript stream fully; hold on the final line "requires your signature." | "And the future seat. Meridian ships its own Agent Skill — the same pattern Cleanverse uses for ClevrPay. An analyst agent queries the book, simulates a tier raise, drafts the report — and hits a wall exactly where it should: enactment requires a human signature. There is no write endpoint on the agent surface. By design." | Slight smile on "By design." |
| 12 | 2:56–3:10 | Terminal, big font. Run: `node --import tsx server/scripts/smoke-cooperate-live.ts` → 9/9 GREEN. Quick cut: `forge test` tail → 22 passed + parity line. | "Under the hood: nine of nine live calls against the Cleanverse sandbox. Twenty-two contract tests. And five hundred differential vectors proving our simulator and the on-chain gate can never disagree." | Fast cuts, terminal beats land on VO numbers. |
| 13 | 3:10–3:20 | Veo clip `media/veo-act3.mp4` — or fallback: landing hero, slow zoom on the logo. End card: logo + "Compliance that can see." + repo URL. | "Cleanverse made compliance executable. Meridian makes it visible. Compliance… that can see." | Final line slow; hard cut to silence on the end card. |

**Assembly notes:** cut on actions, never mid-animation; keep UI audio muted; music (optional) — minimal dark ambient at −26dB, duck under VO; export 1080p60 H.264 ~12Mbps.

## Window runbook (Aug 8, 00:00 UTC — in order)

1. Preserve the public pre-work baseline; publish each in-window build artifact as a separate commit. Verify the range in `docs/hacking-window.md`.
2. Deploy Monad: `cd contracts && set -a && . ../.env && set +a && ../.toolchain/forge script script/Deploy.s.sol --rpc-url $MONAD_RPC --broadcast` → paste addresses into deployments.md → commit
3. `node --import tsx server/scripts/sync-live-holders.ts` (once) → boot server → confirm `cooperate=LIVE chain=LIVE` → run e2e live → commit results into docs/04
4. Vercel: `cd web && npx vercel --prod` (Root Directory: web) → link into README + one-pager
5. Record demo per script above; ElevenLabs VO; assemble; upload
6. Aug 9: send the submission email (top of this doc) with video + one-pager + links; verify every link from a logged-out browser

| Submission checklist | Status |
|---|---|
| Registration | ✅ done (Uniq Minds — approved listing pending review) |
| Sandbox credentials live (9/9 smoke) | ✅ |
| Monad deployer funded (5 MON) | ✅ — deploy at window open |
| Public repo + in-window commits | ✅ 20 separate commits at ledger publication; public compare link in `hacking-window.md` |
| Contracts on Monad + deployments.md | ✅ five contracts and seven successful public receipts |
| Vercel URL cold-browser test | ✅ https://meridian-three-olive.vercel.app |
| Demo video + ElevenLabs VO | ☐ recorded during window |
| One-pager + submission email | ✅ drafted above — fill links, send Aug 9 |
