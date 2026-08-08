# Cleanverse Build: Trusted Assets Hackathon — Judging Report

Source: https://cleanverse.com/hackathon (Projects tab, retrieved 2026-08-08)
**155 registered projects** — 73 RWA track, 71 DeFi track, 11 untagged. Status: all "In Development" (hacking period Aug 8–9).

## Judging Criteria (weights)
1. **Cleanverse integration depth (30%)** — Is CVI/CVA/CCP load-bearing or decorative?
2. **Innovation (25%)** — New mechanism vs. another invoice-factoring clone?
3. **Problem significance (20%)** — Real market pain, sized correctly?
4. **Execution evidence (15%)** — Deployed contracts, tests, live demos, measurements?
5. **Feasibility & clarity (10%)** — Can this ship? Is the pitch coherent?

---

## 🏆 TOP 10

### 1. Venue – The Clean Orderbook (RWA) — 9.5/10
Eligibility-projected order book where CVI shapes the visible liquidity per viewer and CVA settles both legs. The key insight: *make eligibility a property of market microstructure, not a post-hoc transfer gate* — ineligible pairs never form, so refusals cost no gas. **Execution evidence is best-in-class**: live on Monad testnet, deployed DvP settlement contract, 19 Foundry tests + 60,000 property-based cases proving no matched pair breaks the rule set, end-to-end demo with credential lapse removing orders from every book. Solves the real problem (tokenizing RWAs is solved; *selling* them is not).

### 2. Plumb (RWA) — 9.3/10
The most original observation in the hackathon: *every compliance system can prove what it permitted; none can prove what it stopped* — a reverting refusal erases its own record. Plumb's TransferDesk records the refusal decision permanently (typed selector, not string), never reverting on refusal. Backed by real measurement: 157 permissioned tokens indexed on Monad testnet and Base Sepolia, a reproducible 27-vector ERC-3643 suite, L2BEAT-style stage ladder (134 tokens on only 30 implementations; none reach Stage 1), content-addressed append-only archive, deployed contracts. This is infrastructure the whole ecosystem needs.

### 3. Tenor (RWA) — 9.2/10
Ports the clearing-house insight — *margin is sized for the close-out window, not the current instant* — to credential risk. If a buyer's CVI expires before a forward settles, the trade isn't blocked, it's **priced**: a compliance bond in CVA sized by days of exposure and verification tier, with a pre-settlement re-verification checkpoint and deterministic unwind that compensates the innocent counterparty. Turns "indefinite freeze" into a defined price and defined outcome. Demo: three trades on Monad testnet (clean / bonded-settled / bonded-unwound). Genuinely new primitive.

### 4. Covenant – Confirmed-Obligation Receivables Desk (RWA) — 9.0/10
Inverts invoice factoring correctly: the **obligor** (the party who owes) must hold a Cleanverse A-Pass and counter-sign the debt via EIP-712 *before* a note can exist — none of Centrifuge/Huma/Polytrade/Goldfinch do this. Advance rate priced off obligor's verified tier; identity re-checked at three independent layers so a lapsed tier is caught wherever it happens. Live on Monad testnet, six contracts, 19/19 tests, working product + pitch site. (Note: 4 unrelated projects named "Covenant" registered — this is the receivables one.)

### 5. Pignora (RWA) — 8.9/10
Compliant repo rail on Monad: collateral leg escrowed against aUSDC cash leg with per-tier haircuts from an on-chain mirror of A-Pass state (tier 3 = 200bps, tier 1 = 1000bps). Credential revocation/freeze/expiry are **protocol triggers** enabling permissionless closeout with fails-closed per-claimant escrow. Append-only JSONL audit ledger + PDF artifacts, Travel Rule hashes anchored on-chain. 16 Foundry tests + full on-chain lifecycle executed against real deployed contracts. Institutional-grade thinking.

### 6. Meridian (RWA) — 8.8/10
Mission control for verified-asset issuers — **Simulate → Enact → Prove**. Differential sweep engine evaluates every holder and pending distribution leg under a *draft* RuleV2 policy before enactment (who strands, what value freezes, which coupons fail), differentially tested against the on-chain gate so simulator and contract can never disagree. One-call enactment through the Cleanverse API with policy versions anchored in an on-chain hash chain; exportable regulator-verifiable evidence packs; stranded distributions suspend into escrow rather than being lost. Solves the #1 institutional blocker: enacting rule changes blind.

### 7. Recourse (DeFi) — 8.6/10
Identifies the structural hole every compliant-lending project silently steps over: *when a loan backed by a transfer-restricted A-Token defaults, the standard liquidation path (dump on an open DEX) is rejected by the token's own transfer gate.* Recourse is the liquidation venue for restricted collateral — the missing exit that compliant lending assumes exists. Pairs naturally with half the lending projects in this hackathon. Sharp problem selection.

### 8. Mezzanine (RWA) — 8.5/10
Brings capital structure on-chain: verified identity determines not just *whether* you hold an asset but *which class* — senior/junior tranches with a loss waterfall. Tokenized RWAs today are issued flat (one class, pro-rata losses), which is not how real assets are financed; regulators also restrict who may hold junior risk. Identity-tiered tranching is a real institutional primitive and a natural fit for CVI tiers.

### 9. STRATA (DeFi) — 8.4/10
Moves the compliance boundary from the **pool** to the **position**: deposits mint shares stamped with the depositor's CVI tier and the asset's CVA origin, so one unverified LP no longer makes an entire pool non-compliant. Directly attacks the fragmentation of ~$32B of ERC-3643 assets into thin per-jurisdiction silos. Elegant mechanism, correct diagnosis of why permissioned venues have no liquidity.

### 10. NetClear (RWA) — 8.3/10
Compliance-closed **multilateral netting** for CVA obligations: institutions that owe each other from purchases/redemptions/fees settle net positions instead of every obligation separately — less locked aUSDC, fewer transfer fees, fewer failure points. Accepts EIP-712 obligations and settles only among verified parties. Settlement-optimization infrastructure is unglamorous but exactly what institutional adoption requires.

---

## Honorable Mentions (8.0–8.2)
- **Lien** (8.2) — pre-mint firewall against double-tokenization/double-pledging of the same asset across chains; costly real fraud vector.
- **Surety** (8.2) — bonded compliance: CVA bond gives credentials economic downside if wrong.
- **Saksi** (8.2) — privacy-preserving holder registers that stay compliance-provable; the hardest tension in institutional RWA.
- **Continuity** (8.1) — parametric insurance paying lenders when a borrower's CVI is revoked mid-loan, instead of freezing.
- **Crossing** (8.1) — non-custodial atomic DvP router for A-Tokens; solves the composability-collapse of gated tokens.
- **NullRWA** (8.1) — data-driven: measured that Monad's RWAs are unreachable, not illiquid (CETES: $100k across exactly 1 wallet).
- **CleanSettle** (8.1) — compliance holding under Monad's parallel execution, proven live under concurrent load.
- **ClearFactor** (8.0) — lifecycle-complete invoice notes; revocation path mirrors UCC 9-610/9-615 (removes holding rights, not property rights).
- **KLYRO** (8.0) — prices compliance as a parameter instead of gating liquidity.
- **Virgil** (8.0) — continuous re-verification with staked challenge/slashing economics.

---

## Full Ranking (all 155 projects)

| # | Project | Track | Score | One-line judge note |
|---|---------|-------|-------|---------------------|
| 1 | Venue – The Clean Orderbook | RWA | 9.5 | Eligibility-projected orderbook; deployed, 60k property tests |
| 2 | Plumb | RWA | 9.3 | Proves what compliance *stopped*; refusal ledger + 157-token register |
| 3 | Tenor | RWA | 9.2 | Prices credential-expiry risk as compliance bonds on forwards |
| 4 | Covenant (receivables desk) | RWA | 9.0 | Obligor counter-signs debt before note exists; live, 19/19 tests |
| 5 | Pignora | RWA | 8.9 | Compliant repo with identity-tier haircuts; full lifecycle on-chain |
| 6 | Meridian | RWA | 8.8 | Simulate→Enact→Prove policy console for issuers |
| 7 | Recourse | DeFi | 8.6 | Liquidation venue for transfer-restricted collateral |
| 8 | Mezzanine | RWA | 8.5 | Identity-tiered tranching / loss waterfall for RWAs |
| 9 | STRATA | DeFi | 8.4 | Per-position compliance in shared liquidity pools |
| 10 | NetClear | RWA | 8.3 | Compliance-closed multilateral netting |
| 11 | Lien | RWA | 8.2 | Double-financing firewall, pre-mint |
| 12 | Surety | DeFi | 8.2 | Bonded compliance — credentials with economic downside |
| 13 | Saksi | RWA | 8.2 | Private holder registers, still compliance-provable |
| 14 | Continuity | DeFi | 8.1 | Parametric insurance on mid-loan CVI revocation |
| 15 | Crossing | DeFi | 8.1 | Non-custodial DvP router for gated A-Tokens |
| 16 | NullRWA | RWA | 8.1 | Measured RWA unreachability on Monad; distribution fix |
| 17 | CleanSettle | RWA | 8.1 | Compliance correct under parallel-execution load |
| 18 | ClearFactor | RWA | 8.0 | Full-lifecycle invoice notes; UCC-aligned revocation |
| 19 | KLYRO | DeFi | 8.0 | Prices compliance instead of gating it |
| 20 | Virgil | RWA | 8.0 | Continuous re-verification + staked challenges |
| 21 | Keystone Protocol | RWA | 7.8 | Living Operating Rights reprice on CVI status |
| 22 | Trellis | RWA | 7.8 | Share registry with transfer rules enforced by the shares |
| 23 | Warden (treasury agent, RWA) | RWA | 7.7 | Mandate-bound autonomous treasury, on-chain CVI/CVA gate |
| 24 | Inhera | RWA | 7.6 | Split one building into separately-financeable rights (Rights Graph) |
| 25 | Rebind | RWA | 7.6 | Key-loss recovery for compliance-bound assets |
| 26 | SUTURE | DeFi | 7.6 | Lineage tracking of compliant assets through vaults/wraps |
| 27 | Conduit | DeFi | 7.6 | Cross-chain compliance-preserved DvP |
| 28 | Edict | DeFi | 7.5 | Autonomous compliance OS above DeFi protocols |
| 29 | Procura Labs | DeFi | 7.5 | Notarized on-chain mandates for AI agents |
| 30 | CAIRN CLEARRAIL | RWA | 7.5 | Verified-work payroll funding notes |
| 31 | Quorum | RWA | 7.5 | Person-level (not wallet-level) holder rules via CVI |
| 32 | PACT | RWA | 7.4 | Contracts themselves as programmable assets (VAAs) |
| 33 | Sevrin finance | RWA | 7.4 | Lot-level selective recall, no blanket freezes |
| 34 | Suspense | RWA | 7.4 | Suspense-account lifecycle for ineligible distributions |
| 35 | CircuitLend | RWA | 7.4 | Hardware-enforced collateral (machine as enforcement) |
| 36 | EscrowNad | RWA | 7.4 | Escrow for the real ~$900M/yr IPv4 transfer market |
| 37 | Coven | RWA | 7.4 | ZK-encrypted invoices, commitment on-chain |
| 38 | Kudira | DeFi | 7.4 | On-chain BNPL underwritten by CVI, not collateral |
| 39 | Legacy | RWA | 7.3 | Succession/inheritance layer for tokenized assets |
| 40 | BackStop | DeFi | 7.3 | Continuous CVI monitoring through loan lifetime |
| 41 | Revoca | DeFi | 7.3 | Revocation as live event, not entry check |
| 42 | Talon | RWA | 7.3 | Record-date vs pay-date dual CVI checkpoints |
| 43 | VaultMind | DeFi | 7.3 | Policy-gated AI vault managers + hash-chained audit |
| 44 | Covenant (fixed-rate credit) | DeFi | 7.3 | Fixed-rate/maturity loans, credential-tiered collateral |
| 45 | Covenant (fixed-income) | DeFi | 7.3 | Institutional fixed-rate lending compliance layer |
| 46 | Warden (agent rail) | DeFi | 7.2 | KYC/caps for autonomous agent payments |
| 47 | Tessera | DeFi | 7.2 | CVI tier as live collateral-ratio parameter |
| 48 | Standing Protocol | DeFi | 7.2 | EIP-712 identity score as collateral |
| 49 | ClearFlow (factoring) | RWA | 7.2 | Dual-verified invoice factoring; kills double-financing |
| 50 | Tokenta | RWA | 7.2 | Verified exchange for AI compute capacity |
| 51 | MachineTrust | RWA | 7.2 | Machine identity/provenance for equipment finance |
| 52 | BridgeSure | RWA | 7.2 | Milestone escrow with continuous compliance mid-transit |
| 53 | AMBIT | RWA | 7.2 | Map-painted jurisdictions become real transfer rules |
| 54 | Chlorine Protocol | DeFi | 7.1 | Liquid staking with per-deposit provenance |
| 55 | Continuum | DeFi | 7.1 | Permissioned staking; freeze-not-confiscate |
| 56 | Nimbra | DeFi | 7.1 | On-chain credit bureau + under-collateralized pools |
| 57 | AVAL | DeFi | 7.1 | Identity-based credit for the uncollateralized |
| 58 | Credence (Clearline) | DeFi | 7.1 | AI underwriter on CVI credit profiles |
| 59 | Tripwire | DeFi | 7.1 | Credit for AI agents (x402/ERC-8004 gap) |
| 60 | Certus | DeFi | 7.1 | Declared payment intents, re-validated every milestone |
| 61 | VeriAgent | DeFi | 7.1 | Identity/policy layer for financial agents |
| 62 | Opera | RWA | 7.1 | Operator governance rights tied to live compliance score |
| 63 | Veyra | RWA | 7.0 | Dynamic post-onboarding eligibility layer |
| 64 | Keepr | RWA | 7.0 | Warehouse receipts as financeable CVAs |
| 65 | CleanRail | RWA | 7.0 | Yield-bearing escrow replacing bank Letters of Credit |
| 66 | diversifi | RWA | 7.0 | SME FX-risk agent across Arbitrum/Celo/HashKey |
| 67 | AttestVault | RWA | 6.9 | Attestation dossier hashed before mint allowed |
| 68 | ClearIssuance | RWA | 6.9 | End-to-end compliant issuance pipeline |
| 69 | Notaris | RWA | 6.9 | Asset Passport per tokenized RWA |
| 70 | CleanACE | RWA | 6.9 | Institutional issuance + secondary, CVI-gated |
| 71 | CleanList | RWA | 6.8 | Issuer-controlled transfer/settlement layer |
| 72 | CounterSpec | DeFi | 6.8 | Differential testing for policy changes pre-deploy |
| 73 | REVOKED | DeFi | 6.8 | Side-by-side naive vs hardened vault demo |
| 74 | NexusRWA | RWA | 6.8 | Unified RWA issuance OS |
| 75 | Mordant | RWA | 6.8 | Locked guarantee compensates double-financed investors |
| 76 | RWCAR | RWA | 6.8 | On-chain RWA repo market |
| 77 | Splitrail | DeFi | 6.8 | Atomic multi-merchant split-escrow for agents |
| 78 | Covenant (agent lending) | DeFi | 6.8 | Bounded borrowing mandates for agents |
| 79 | Principal | DeFi | 6.7 | Revocable passports binding orgs to contracts |
| 80 | Assay | DeFi | 6.7 | Merchant settlement agent on a verified leash |
| 81 | Creance (Okremit) | DeFi | 6.7 | Mandate-as-executor for agent spend |
| 82 | EstateKey | RWA | 6.7 | Fractional real estate, CVI-gated |
| 83 | Riff | RWA | 6.7 | Compliant music-royalty issuance |
| 84 | Clearwave | RWA | 6.7 | Indie-artist royalty sales to verified investors |
| 85 | CLEAR | RWA | 6.6 | Invoice finance + AI forgery screening |
| 86 | Para Liquid | DeFi | 6.6 | Async identity-gated liquidation auctions on Monad |
| 87 | Clean Privacy | DeFi | 6.6 | Compliant privacy rail |
| 88 | ConsentFlow | DeFi | 6.6 | Revocable clinical-data consent rail |
| 89 | Adelanto | RWA | 6.6 | Verified PO financing, funds restricted to suppliers |
| 90 | Provena | RWA | 6.6 | Invoice tokenization + borrow-against-invoice |
| 91 | ClearLedger | RWA | 6.5 | Buyer-confirmed invoice financing |
| 92 | ReciboX | RWA | 6.5 | MSME invoice tokenization |
| 93 | Bidnox | RWA | 6.5 | Confidential-auction invoice financing (Inco) |
| 94 | Tamarind | RWA | 6.5 | Business-history workspace proving invoice legitimacy |
| 95 | CleanGraph | RWA | 6.5 | Pre-signing policy check orchestration |
| 96 | CleanTreasury AI | DeFi | 6.5 | Compliance-gated treasury AI |
| 97 | veriflow AMM | DeFi | 6.5 | Travel-Rule-compliant walled-garden AMM |
| 98 | Custos | DeFi | 6.5 | Passkey wallet, CVI re-verify key rotation |
| 99 | ReliefCart | RWA | 6.5 | Single-use programmable claim benefits |
| 100 | Amperium | RWA | 6.5 | GPU-backed private credit |
| 101 | ChaSwipe | RWA | 6.4 | Swipe UX for compliant RWA discovery |
| 102 | Barzakh AI | RWA | 6.4 | Tokenization/settlement agent |
| 103 | VeriLend | DeFi | 6.4 | CVI credit signal + CVA-only settlement |
| 104 | VeriLend RWA | RWA | 6.4 | Permissioned debt marketplace |
| 105 | CleanCredit | DeFi | 6.4 | Identity-as-collateral lending pool |
| 106 | Vera | DeFi | 6.4 | Trust-score-based lending terms |
| 107 | Vera Credit | DeFi | 6.3 | Track-record-based borrowing |
| 108 | Kredlume | DeFi | 6.3 | Programmable credit limits via CVI |
| 109 | TrustLend | DeFi | 6.3 | Tier-based collateral ratios (150%→80%) |
| 110 | CivicMandate | DeFi | 6.3 | Verified-identity governance for protocols |
| 111 | Legate | DeFi | 6.3 | Verified remittance rail |
| 112 | Countersign Clear | RWA | 6.3 | Atomic agent-to-agent verified settlement |
| 113 | CleanFin | DeFi | 6.3 | Position-NFT DeFi, 5 venues, shared ledger |
| 114 | AjoCred | DeFi | 6.3 | Remittance-history-based credit (Nigeria) |
| 115 | Freeliance | DeFi | 6.3 | Identity-gated freelance settlement |
| 116 | The Artisans | DeFi | 6.2 | Worker marketplace with escrow + credit building |
| 117 | CleanPay | DeFi | 6.2 | African escrow/payments |
| 118 | CleanFlow (DeFi) | DeFi | 6.2 | Trust/compliance OS for merchants |
| 119 | VeriFi | DeFi | 6.2 | Identity signals for stablecoin txs |
| 120 | BizPilot | RWA | 6.2 | AI COO anchoring records on-chain |
| 121 | Monsoon | RWA | 6.2 | Exporter receivables financing |
| 122 | ClearCredit | DeFi | 6.2 | SME invoice liquidity pool |
| 123 | SovereignX | RWA | 6.2 | ERC-3643 commercial real estate |
| 124 | RWA Issuance Platform | RWA | 6.1 | Self-service CVA issuance portal |
| 125 | Veridex | RWA | 6.1 | Asset Passport + risk indicators |
| 126 | Cross-Border Payroll Rails | RWA | 6.1 | Stablecoin payroll + Travel Rule reports |
| 127 | Warden (payments) | DeFi | 6.1 | Mandate-capped supplier payments |
| 128 | RiskLens | DeFi | 6.1 | CVI-sharpened approval-risk scanner |
| 129 | Kitedesk | DeFi | 6.0 | Agentic API commerce with spend caps |
| 130 | BeanForQuote | RWA | 6.0 | RFQ settlement for tokenized coffee |
| 131 | Independent Builder (PactFlow) | RWA | 6.0 | Revocable agent authority for deals |
| 132 | Sentra | DeFi | 5.9 | Plain-English compliance assistant |
| 133 | ClearLend | DeFi | 5.9 | Identity-terms lending (thin detail) |
| 134 | Sentinel Compliance Agent | DeFi | 5.8 | CVI pool gate + audit trail |
| 135 | The Digital Dam | DeFi | 5.8 | Captures burned ETH base fee as yield |
| 136 | BitV | DeFi | 5.8 | Identity-native DeFi suite (generic) |
| 137 | AssetCupid | RWA | 5.8 | "Asset has its own AI agent" — vision > spec |
| 138 | Archon Wallet | DeFi | 5.7 | All-in-one verified wallet |
| 139 | NexaFi | DeFi | 5.6 | Identity-enabled DeFi (generic) |
| 140 | SentinelGuard | DeFi | 5.6 | Gated pools + lending (generic) |
| 141 | Clean Board | RWA | 5.6 | Web3 ad-space RWA bidding |
| 142 | Collective | DeFi | 5.5 | Group NFT fundraising; compliance fit unclear |
| 143 | GridPad | DeFi | 5.5 | Social marketplace w/ escrow |
| 144 | Jolly Roger | RWA | 5.4 | TCG card room; tangential to tracks |
| 145 | annaumixyz | DeFi | 5.4 | DeFi discovery/safety (generic) |
| 146 | TrustRail | RWA | 5.2 | One-paragraph compliant tokenization |
| 147 | DegenSlide | DeFi | 4.8 | Whale copy-trading; no Cleanverse angle |
| 148 | Orbital | DeFi | 4.5 | UniV4 multi-stable hook; no Cleanverse integration shown |
| 149 | Vino | DeFi | 4.5 | Invoice minting + agent (minimal detail) |
| 150 | Theorix | DeFi | 4.2 | One-sentence aspiration, no mechanism |

*(Remaining name-collision entries — second "ClearFlow" (#75 in source, B2B receivables) scores 6.6; third "Covenant" and third "Warden" are listed at their respective rows above. Five entries share names with other teams: Covenant ×4, Warden ×3, ClearFlow ×2, Vera ×2, VeriLend ×2 — flag for organizers.)*

## Judge's Summary
- **Crowded lanes**: invoice/receivables financing (~15 projects) and under-collateralized CVI lending (~12). Good projects there score 6.2–7.4 but none break out except **Covenant** (obligor-signed) and **ClearFactor** (lifecycle law).
- **What separated the top 10**: a *new mechanism* (refusal proofs, credential-duration pricing, position-level compliance, netting, tranching, liquidation exit) plus *execution evidence* (deployed addresses, property tests, measured data).
- **Data caveats**: judging based on registered project descriptions only — repos/demos not individually audited; several descriptions were truncated on the page.
