# 00 — RECON: Cleanverse Build "Trusted Assets" Hackathon

*Compiled 2026-08-07. Sources: cleanverse.com/hackathon (live page + Apply form), cleanverse.com, official `cleanverseorg/clevrpay` repo (contains official Skills API docs), and four public competitor repos whose authors held gated-doc access (ClearFactor's `.planning/` research, sentinelguard README, cx402 typed client, compliance-router). Everything below is verified against at least one primary artifact; items marked ⚠ are single-source.*

---

## 1. Hackathon facts

| Item | Value |
|---|---|
| Name | Cleanverse Build: Trusted Assets Hackathon (2nd edition) |
| Support | **Monad Foundation** |
| Prize pool | $16K USDC — **top 3 per track, two tracks judged independently** |
| Registration | Jul 21 → **Aug 7 23:59 UTC (today)** — API keys + gated docs arrive instantly by automated email |
| Hacking window | **Aug 8 00:00 → Aug 9 23:59 UTC (48h)** — submissions completed inside this window |
| Judging | Aug 10–14; judges review **repos, demo videos, and working deployments directly** |
| Tracks | **RWA** (tokenization w/ compliance from issuance; CVI+CVA, transfer restriction, Travel Rule) and **DeFi** (CVI as entry condition/risk parameter; gated pools, under-collateralized lending, permissioned staking, CVA settlement) |
| Out of scope | Projects unrelated to RWA/DeFi, or designed to circumvent compliance |
| Chains | Ethereum, Arbitrum, Base, BNB, Polygon, HashKey, **Monad** (+ Solana, PlatON on main site) |

### Official judging rubric (from Apply page — verbatim)

| Criterion | Points |
|---|---|
| **Depth of CVI·CVA Integration** | **30** |
| **Build Quality** | **25** |
| Concept & Problem Definition | 20 |
| **UX & Demo** | **15** |
| Scalability Potential | 10 |

Additional considerations (verbatim): use primitives *meaningfully*; solve *real financial infrastructure problems*; **can be piloted with institutions or merchants**; improve trust/compliance/interoperability; clear user value; technically feasible beyond the hackathon.

**Read of the rubric:** 70/100 points are execution (integration depth + build quality + demo). Concept is only 20. In a ~90-project field full of good one-liners, the win comes from *provable depth* and *flawless execution*, not concept poetry.

---

## 2. API capability map (all 8 primitives)

### Two REST surfaces + one on-chain surface

| Surface | Base URL (sandbox) | Auth |
|---|---|---|
| **Cooperate API v5.6** (admin + identity + asset + reporting) | `https://uatapi.cleanverse.com/api/cooperate` | `api-id` header (App ID). App Key = local base64 AES key — encrypts write bodies, **never transmitted** |
| **Skills API** (Agent Skill Framework) | `https://uatapi.cleanverse.com/api/skills` | **None** (public, works today without registration) |
| **On-chain** | A-Pass NFT + APass Compliance Validator + Access Core + A-Token contracts per chain | n/a (public reads; writes via admin API) |

Production hosts: `api.cleanverse.com/api/cooperate`, `api.cleanverse.com/api/skills`. Response envelope everywhere: `{code:"0000"=success, message, data}` (`0001` param error, `0002` general failure). All params lowercase. Write-body encryption: AES/CBC/PKCS5, fixed zero IV, key = base64-decoded App Key, body = `{"data":"<base64 ciphertext>"}` — Node built-in `crypto` suffices.

### Primitive 1 — CVI (A-Pass) · Cooperate API

| Endpoint | Enc | Purpose |
|---|---|---|
| `POST /generate_apass` | AES | Mint A-Pass: `customerId` (≥12 chars, institution-assigned), `subTier` 1–99, `subGroup` (2 letters), `expirationTime` (unix s), `wallet{chain,address}`, `identityDataList[]` (NID/PASSPORT/…), optional bank accounts |
| `POST /query_apass` | plain | `(chain,address)` → `cvRecordId` (stable identity key across wallets!), `tier`, `subTier`, `group`, `subGroup`, `status` (1=active, 2=frozen), `expirationTime`, `currentKycHash` |
| `POST /query_apass_list` | plain | All A-Passes for the institution |
| `POST /verify_apass` | plain | `(chain, atoken, address)` → result code: **1**=A-Token not found, **2**=no A-Pass, **3**=A-Pass blocked (expired/frozen), **4**=valid+transfer allowed. Returns `magickLink` on block (send user to get verified) |
| `POST /update_status` | AES | Freeze(2)/activate(1) by `customerId`/`cvRecordId`/wallet, optional `blacklistReason` — **freeze is an on-chain tx (returns tx hash)** |

Key facts: PII stays local (only KYC *hash* on-chain); credentials are revocable and expire; `cvRecordId` = cross-wallet identity key (off-chain resolution only). On-chain, only a boolean `hasAPass` is readable; tier/expiry reads revert (⚠ Crossing's finding; and `hasAPass(0xdEaD)` reportedly true on Base Sepolia — don't trust the bare boolean as policy).

### Primitive 2 — CVA (A-Token) · Cooperate API

| Endpoint | Enc | Purpose |
|---|---|---|
| `POST /atoken/launch` | AES | Launch new A-Token with compliance rules |
| `POST /atoken/register_atoken` | AES | Wrap an existing token as A-Token |
| `POST /atoken/add_rule` / `set_rule` / `remove_rule` | AES | Manage RuleV2 rules |
| `POST /atoken/rules` | plain | Query rules |
| `POST /atoken/set_paused` | AES | Pause/unpause |
| `GET /atoken/list_my_atokens` | AES | List institution's A-Tokens |
| `POST /query_deposit_atoken_list` | plain | Supported A-Tokens + **on-chain contract addresses incl. A-Pass NFT & AccessCore per chain** |
| `POST /faucet` | AES | Test A-Token drip (⚠ was broken on sandbox in June — faucet wallet unfunded; re-verify) |

**A-Token transfer semantics (the load-bearing fact):** the compliance check lives *inside the token's transfer path* and fires on **both `from` and `to`**. Consequences: (a) any contract that custodies A-Tokens must itself hold an A-Pass (register protocol contracts or every settlement reverts); (b) transfers to unverified/frozen/expired wallets revert at the token layer — no app-layer bypass; (c) A-Token symbols use `a` prefix (aUSDC). Monad support: **USDC only → aUSDC**.

### Primitive 3 — CCP Protocol (pre-transaction checks, Validator)

| Endpoint | Enc | Purpose |
|---|---|---|
| `POST /validator/grant` | AES + **EIP-191 sig** | Grant REGISTER_ROLE to your pool contract |
| `POST /validator/register` (aka registerV2) | AES + **EIP-191 sig** | Register a contract as a compliance pool with its own RuleV2 |
| `POST /validator/is_register` | plain | Check registration |
| `POST /validator/set_rule` / `add_rule` / `remove_rule` / `rules` | AES / plain | Per-pool rule management |

EIP-191 signature = sign `chain + contract_address` (lowercase, concatenated, e.g. `base0x742d…`) with the contract owner key. **RuleV2 is 5-dimensional:** allowed `group` (1–2 chars), `sub_group`, `min_tier` 0–99, `min_sub_tier` 0–99, country allow/deny list with `is_black_list` toggle (added v5.5/v5.6). 0 = no restriction. Different pools can carry different rules (documented example: BTC/USDT pool tier 30, ETH/USDT pool tier 40). On-chain hot path: your contract calls the **APass Compliance Validator** (`complianceVerify(pool, wallet)` pattern); paused pools may *revert* rather than return false — **fail closed, fail legibly**.

### Primitive 4 — Travel Rule & Reporting · Cooperate API

| Endpoint | Purpose |
|---|---|
| `POST /download_travel_rule` | `(txHash, wallet{chain,address}, customerId?/cvRecordId?)` → time-limited official report (PDF) download |
| `POST /query_txs` | Transaction history queries |

### Primitive 5 — Agent Skill Framework · Skills API (public, no auth)

Official skill package: `cleanverseorg/clevrpay` (SKILL.md + full API reference — this *is* their flagship agent product). 7 endpoints:

| Endpoint | Params | Returns |
|---|---|---|
| `POST /get_magiclink` | — | A-Pass registration URL |
| `POST /query_apass` | chain, address, symbol? | tier/expiry/state/group/kycHash |
| `POST /query_deposit_address` | chain, address, symbol? | deposit wallets + `aPassAddress` |
| `GET/POST /query_chain_config` | — | **live config: every chain's RPC, explorer, operator/fee addresses, A-Pass address, tokens w/ A-Token addresses, decimals, access_core** |
| `POST /query_deposit_institutions` | chain, symbol | whitelisted custodians (e.g. Anchorage Digital) per origin/A-Token pair |
| `POST /register_data` | chain, symbol, address | user→deposit address mapping |
| `POST /query_user` | chain, symbol, address | registration status, deposit mapping, `blacklist_reason` |

Framework promise (hackathon page): "programmable mandate execution with principal verification, counterparty validation, spend controls, immutable audit trails."

### Primitive 6 — Gateway Network
Licensed on/off ramps: deposit flow = get deposit address → transfer from whitelisted institution → backend auto-mints A-Token. Withdraw = **Access Core contract** `withdraw(aToken, amount, recipient)` (ABI public, emits `Withdraw(aToken, originToken, amount, recipient, data)`).

### Primitive 7 — Clean Payment Rails
End-to-end compliant stablecoin payments: clean routing, escrow settlement, merchant acceptance. Productized as **ClevrPay**. Exposed to us through A-Token transfers + deposit/withdraw + skills endpoints.

### Primitive 8 — Playground
Compliance workbench (rule design, flow validation, audit reports) — web UI, gated behind registration. ⚠ Not independently verified.

### Chain facts (Monad testnet — live-verified by ClearFactor team)
Chain ID **10143** (`0x279f`) · 300ms blocks · 150M block gas limit · gas charged on **limit not usage** (always `simulateContract` first) · `eth_getLogs` capped at **100 blocks** (HTTP 413 above) · `block.timestamp` non-decreasing but NOT strictly increasing (use `>=`) · deferred execution D=3 blocks (funded wallets can't tx for ~1s) · 128KB contract size limit · verify via Sourcify/MonadVision · RPC `https://testnet-rpc.monad.xyz`.

### Access & blockers
- **docs.cleanverse.com = invitation code**, delivered by registration email. → `HUMAN ACTION REQUIRED #1` (register before 23:59 UTC today).
- Cooperate API needs `api-id` + App Key from that same email. Integration role tiers exist; hackathon teams received **Issue Member** (full access incl. Validator + A-Token launch) last cohort.
- **Skills API needs nothing** — we can integrate it live immediately.
- No public starter kit; the only official public repo is the clevrpay skill (which is itself the best integration template).

---

## 3. Competitor dossiers

~90 registered projects enumerated from the live Projects listing (both tracks). Track labels from the listing. **Ceiling** = the best this becomes by judging day given 48h.

### Tier S — the entries to beat

| # | Project | Track | Concept | Primitives | Strengths | Weaknesses | Ceiling |
|---|---|---|---|---|---|---|---|
| 1 | **ClearFactor** | RWA | Compliance-native invoice factoring; ERC-1155 `_update` choke point, freeze→grace→Dutch-auction forced exit, hash-linked receipts | CVI, CVA, CCP, TR | *Extreme* engineering rigor (public 4-researcher defect analysis, 30 spec defects pre-closed, Foundry invariants + mutation testing); UCC 9-610/9-615 framing | Invoice factoring = the most crowded lane (16+ projects); complexity risk in 48h; public repo leaks their whole play | Best-engineered protocol in the field with airtight tests and a revocation showpiece. The "Build Quality 25pts" benchmark |
| 2 | **Crossing** | DeFi | Non-custodial settlement router for A-Tokens — routes instead of pooling because the transfer gate breaks AMM/vault custody | CVI, CVA, CCP | Sharpest systems insight in the field (composability collapse, boolean-only on-chain reads, `hasAPass(0xdEaD)`=true); positions against everyone else's flaw | Infra story, harder emotional demo; EIP-712 off-chain eligibility adds trust assumptions | The "actually understands the platform" entry; a CTO-judge favorite |
| 3 | **Saksi** | RWA | Confidential holder register: ZK-shielded CVA positions, CVI membership proven in-circuit, revocation = deny-set freeze | CVI, CVA, CCP, TR | Genuinely hard tech; solves a real institutional blocker (position privacy); privacy-with-accountability narrative | ZK circuits in 48h = enormous execution risk; hard to demo legibly | If it works: spectacular. Most likely to impress *and* most likely to be half-real |
| 4 | **Continuum** | DeFi | Permissioned liquid staking (stMON) with policy-gated receipt token + compliance-officer redemption queue ("freeze ≠ confiscation") | CVI, CVA, CCP | Claims sole ownership of the named-but-unbuilt "permissioned staking" lane; already deployed on Monad testnet (4 contracts); did field analysis | Single-mechanism; staking receipt story is niche vs RWA money flows | Clean, complete, deployed, well-positioned. Very dangerous |
| 5 | **Talon** | RWA | Corporate-actions engine: record-date snapshot + pay-date re-verification, 3-way routing (pay/escrow/freeze) per distribution leg | CVI, CVA, CCP, TR, Reporting | Deepest per-leg CCP usage; Foundry invariant plan; realistic 48h scope; audit-pack export | Narrow instrument (coupon runs); UI likely secondary | The "integration depth" rubric maximizer among RWA entries |
| 6 | **Legate** | DeFi | Compliant remittance corridor (SG→India) + agent payments; CCP pre-check before chain, escrow freeze on mid-flight revocation | CVI, CVA, CCP, TR | Corridor story judges *feel*; "a licensed partner could run tomorrow" = incubation bait; x402 stat literacy | Remittance rails = adjacent to Cleanverse's own ClevrPay (may read as clone); big scope | Emotionally strongest demo arc in DeFi track |
| 7 | **Kudira** | DeFi | On-chain BNPL underwritten purely by CVI credential (identity-secured credit; default writes attestation to credential) | CVI, CVA | "Only credit primitive impossible on anonymous chains" — crisp unfair-test pass; merchant SDK vision | Credit modeling in 48h is mostly smoke; default-attestation loop hard to prove | Best one-sentence pitch in the lending cluster |
| 8 | **Conduit** | DeFi | Cross-chain DvP: CVA cash leg on Monad ↔ RWA leg on Arbitrum, atomic both-or-neither + Disposition Kernel for mid-flight revocation | CVI, CVA, CCP, TR | Institutionally real problem; disposition states (HELD/REVERIFY/REBIND…) show maturity | Cross-chain messaging in 48h = high wreck risk; demo needs two chains live | If the two-chain demo lands, top-3 DeFi |

### Tier A — strong, coherent, single-lane

| Project | Track | Concept (one line) | Ceiling |
|---|---|---|---|
| Warden (treasury, RWA) | RWA | Mandate-bound AI treasury agent w/ on-chain CVI/CVA verification before execution | Polished agent demo on Monad; crowded lane blunts it |
| Pignora | RWA | Repo desk w/ tier haircuts, margin calls, credential-event closeouts; 16 Foundry tests, real deployed lifecycle | Institutional-grade; dry demo |
| Covenant (receivables) | RWA | Obligor-countersigned (EIP-712) receivables — payer verified *before* note exists; live on Monad, 19/19 tests | Sharp inversion; already live product URL |
| Mezzanine | RWA | Senior/junior CVA tranches; verification tier = waterfall position; escrow on lapsed credentials | Real capital-structure literacy; complex demo |
| Quorum | RWA | Holder-based private-placement limits via cvRecordId (person, not wallet) | Elegant; narrow |
| AMBIT | RWA | Paint jurisdictions on a world map → strokes become A-Token country rules (v5.6 feature) | **Best signature interaction in the field**; thin mechanics underneath |
| Keepr | RWA | Warehouse receipts w/ 3-party attestation (depositor/warehouse/lender) prevents double-financing | Great story; medium build |
| Lien | RWA | Cross-platform encumbrance registry — asset fingerprint blocks double-tokenization | Infra other projects need; abstract demo |
| Rebind | RWA | Recovery rail: re-bind CVA to same verified person after lost wallet (CVI outlives keys) | Unique lane, high empathy; small surface |
| Suspense | RWA | Distribution engine: ineligible-at-pay-time allocations auto-suspend, recheck, release | Tight, demoable; small |
| BridgeSure | RWA | Milestone trade escrow re-checking compliance at every release | Solid; escrow lane crowded |
| Klyveth | RWA | Atomic DvP desk: KYC-hash-bound settlement receipts, refusal shows exact failed rule | Clean; single-mechanism |
| NetClear | RWA | Multilateral netting for CVA obligations (210→60 aUSDC demo); frozen party poisons cycle | Quant-elegant; niche |
| Recourse | DeFi | Liquidation venue for transfer-restricted collateral (registered as compliance pool w/ own rules + backstop underwriter) | Fills the hole all gated-lending projects ignore |
| KLYRO | DeFi | Prices compliance instead of gating: LP-attached policies, tiered liquidity strata, unverified pay premium | Most original AMM thinking; hard math in 48h |
| Klyro/Custos | DeFi | Passkey wallet + CVI-rooted recovery + pre-flight checks matching chain behavior | Consumer polish play |
| Continuity | DeFi | Parametric insurance on CVI-revocation events (underwriter pool, auto-payout, subrogation) | New financial primitive; oracle trust Qs |
| Tessera | DeFi | CVI tier→collateral ratio + repayment history written back + ASF agent layer | Lending-cluster best-in-class writeup |
| REVOKED | DeFi | Naive vault vs hardened vault side-by-side; fuzz suite proves revoked-wallet drain vs block | Brilliant *educational* demo; judges may love the honesty |
| CONCORD | DeFi | "Living Treaty" agent agreements: 15s monitoring loop, mediator swarm, 12 hash-committed states | Wildly ambitious; 6-of-8 primitives claimed; scope risk |
| Procura | DeFi | Notarized on-chain mandates for AI agents (authority as on-chain object, instant revocation) | Cleanest ASF articulation |
| Assay | DeFi | Merchant money-in/money-out agent, fails closed, escrow both directions | Strong merchant narrative |
| Chlorine | DeFi | Liquid staking receipt as CVA — compliance travels with csETH through DeFi | Good LST-depeg literacy; ETH-centric (not Monad) |
| Saksi/Coven | RWA | ZK invoice commitments + nullifier anti-double-financing | See Saksi; Coven = smaller sibling |
| EscrowNad | RWA | IPv4-address-transfer escrow settling on registry proof ($900M/yr market nobody saw) | Most original asset class; Rust/niche |
| CleanRail | RWA | Maritime bills of lading: MLETR + CargoX oracle + yield-bearing LoC escrow | Huge story; oracle dependency heavy |
| Clearwave | RWA | Music royalty shares w/ compliance-gated issuance; payment rails already live on Monad mainnet | Real existing product = credibility; royalty ≠ core lane |

### Tier B — the long tail (pattern-clustered)

| Cluster (representatives) | Count | Shared shape | Shared ceiling |
|---|---|---|---|
| Invoice financing (ReciboX, Bidnox, Monsoon, Provena, ClearLedger, Tamarind, Adelanto, ClearFlow, Mordant, ClearCredit, Vino, ChaSwipe) | ~12 | Verify SME → tokenize invoice → gated investors → settle in CVA → audit trail | One will execute well; the rest dilute each other. Judges will be numb to invoices by project #5 |
| Identity-tiered lending (TrustLend, Vera, VERA Credit, ClearLend, Kredlume, CleanCredit, VeriLend, Standing, BitV, NexaFi, AjoCred, Vera Credit) | ~12 | CVI tier → collateral ratio 150%→80%; freeze on revocation | Same numbness; TrustLend/Tessera/Kudira own the lane's best versions |
| Agent treasury/payments (Warden ×3, CleanTreasury, VaultMind, Kitedesk, Edict, Sentinel Agent, Barzakh, PactFlow, CleanFlow, Freeliance, Creance/Okremit, GridPad, Archon) | ~14 | Mandate + spend cap + CVI check + audit log | ASF is named by many, *deeply implemented by few*; Procura/Tessera/Assay lead |
| Eligibility/passport layers (Veyra, Notaris, Veridex, CleanList, CleanGraph, AttestVault, MachineTrust, NexusRWA, RWA Issuance Platform, ClearIssuance, CleanACE, SovereignX, VeriLend RWA, Amperium, CleanBoard, Jolly Roger, ReliefCart, Legacy, SUTURE, CounterSpec, Veriflow, ClevrDEX, Clean Privacy, RiskLens, Sentra, VeriFi, annaumixyz, The Artisans, Digital Dam, Theorix, NullRWA, DegenSlide, Orbital, BeanForQuote, RWCAR, Para Liquid, Revoca, BackStop, ConsentFlow, Cross-Border Payroll, CircuitLend, Countersign Clear, Legate…) | ~40 | "We check eligibility before transfer and show an audit trail" in various clothes | Individually reasonable; collectively indistinct |

### Field-level strategic findings

1. **The revocation demo is a commodity.** ≥30 projects climax on "credential revoked → transfer blocked / position frozen → audit trail." It is this hackathon's "todo app."
2. **The gate is everyone's architecture; almost no one's *product*.** Most treat CVI/CVA as a bouncer. The sharpest entries (Crossing, KLYRO, Continuity, Kudira) treat identity as an *economic input* — pricing, insurance, credit, routing.
3. **Integration depth claimed ≫ integration depth real.** Public repos show most "CVI integration" = one `verify_apass` call. Full-surface usage (generate → verify → freeze → validator pool registration w/ RuleV2 → A-Token launch → Travel Rule export → Skills API) appears in *zero* projects end-to-end.
4. **ASF is named everywhere, implemented nowhere deep.** Cleanverse's own flagship repo is an *agent skill*; their strategic bet is agent commerce. Yet every "agent" project is a single agent with a spend cap. Nobody built the *infrastructure judges' own product implies*.
5. **Monad matters.** Foundation supports the event; Monad = first-class Cleanverse chain (aUSDC). Deploying anywhere else forfeits free points.
6. **48h truth:** the median team ships a Next.js dashboard with 2 API calls and slideware contracts. The winning team ships deployed contracts + real API round-trips + a demo that cannot be mistaken for a mock.

---

## 4. The judges' world

- **Cleanverse** (Cleanverse International Pte Ltd, Singapore): compliance-native rules layer; "Clean Money among Clean Hands"; patent-pending; sells to **financial institutions** (issuer memberships, controlled circulation, audit-ready reports), **Web3 infra providers** (compliance overlay), **policymakers** (GovOS supervisory platform). Gateway = licensed on/off-ramps w/ whitelisted custodians (Anchorage Digital visible in sandbox). Flagship consumer/agent product: **ClevrPay** (skills-based agent payments). What makes their ecosystem more valuable: projects that (a) showcase the *whole* stack, (b) create reasons for institutions to join the network, (c) advance agent-commerce settlement — their newest bet.
- **Monad Foundation:** wants flagship apps demonstrating parallel-execution-era finance on Monad testnet; rewards teams that ship *on Monad* and say why (300ms blocks, parallel lanes for independent flows).
- **Inferred judge personas:** Cleanverse CTO (does the integration *actually* round-trip? is the claimed depth real?), Cleanverse BD (can we pilot/incubate this? does it recruit institutions?), Monad DevRel (is Monad load-bearing?), design-literate reviewer (the 15 UX points swing rankings among the top 5).

---

## 5. What it takes to win (thesis)

**The gap:** In a ~90-project field, *nobody* built the product whose primary user is the ecosystem itself, and *nobody* exercises the full API surface. Every project is one mechanism (gate/freeze/tier) wrapped in one vertical (invoices/lending/agents). The two most defensible unclaimed positions are:

1. **Full-surface mastery** — a product where CVI *lifecycle* (generate→tier→expire→freeze→magiclink re-verify), CVA *administration* (launch, RuleV2 incl. country dimension, pause), CCP *pool registration* (registerV2 + EIP-191), Travel Rule *export*, and the *Skills API* are all load-bearing. This directly maxes the 30-pt criterion in a way no single-mechanism project can, and only the Skills API + validator combination makes it possible.
2. **Identity as economics, not access** — the four sharpest competitors point here but stop early. A product where the verified credential *prices, insures, routes, or underwrites* value — visible in numbers on screen, not in a revert message.

**Winning formula = (1) ∧ (2) + Monad + a demo climax that is *not* "transfer blocked."** The concept must be one no invoice/lending/agent project can be described alongside; it must be pilotable by a named institution type; and the UI must convert the 15 UX points into a tiebreak we win. Execution bar: deployed Monad testnet contracts, real sandbox round-trips (with honest simulation fallback), zero-console-error happy path, and a README that proves depth in a table judges can verify in 90 seconds.

Phase 1 will generate 10 candidates and force them through the Unfair/Ecosystem/Business/Story tests against this field.

### Risk register (top 5)

| Risk | Mitigation |
|---|---|
| Registration window closes 23:59 UTC today → no API keys/docs | `HUMAN ACTION REQUIRED #1` below; meanwhile Skills API (no auth) + on-chain surface keep us unblocked |
| Sandbox faucet/API flakiness (documented intermittent 500s, faucet unfunded in June) | Retry-on-transient client (pattern captured); recorded-fixture adapter + honest "simulation" badge |
| A-Token custody trap (contracts need A-Passes) | Design for it from hour 0 — register protocol contracts via validator, or route non-custodially |
| Monad quirks (100-block logs, deferred exec, timestamp ties) | Chunked log walker, block barriers in scripts, `>=` comparisons — all pre-mapped |
| Field convergence (someone ships our idea) | Choose concept that requires full-surface integration — the moat is breadth × 48h, which single-mechanism teams cannot replicate late |

---

## HUMAN ACTION REQUIRED #1 — Register (deadline 23:59 UTC TODAY)

Go to `https://cleanverse.com/hackathon` → Apply → submit:
- **Project icon**: 512×512 PNG (placeholder fine; final logo comes in Phase 3)
- **Project name / Team**: may use working title; final branding lands Phase 3 — if the form is editable later, register NOW with a placeholder
- **Contact email**: yours (API keys + docs invitation code arrive here instantly)
- **Track**: recommend **RWA** (larger, but our concept will be chosen to stand alone in either; final call in Phase 1 — if forced now, RWA)
- **Team background / Project description**: text will be superseded by Phase 1 concept; write 3–4 honest sentences
- Forward the automated email contents (API ID, App Key, docs invitation code, starter-kit link if any) into `.env` (never commit) and share the docs code so the API map can be verified against the primary source.
