<div align="center">

<img src="web/public/brand/logo.svg" width="72" alt="Meridian" />

# MERIDIAN

**Compliance that can see.**

*Meridian is pre-enactment proof for on-chain compliance: the blast radius of any policy change is computed, proven identical to what the chain will enforce, and anchored before the rule becomes law. The console is the interface to the primitive.*

**Cleanverse Build: Trusted Assets Hackathon · RWA Track · Deployed on Monad testnet (chain 10143)**

[![CI](https://github.com/iamdflame/meridian/actions/workflows/ci.yml/badge.svg)](https://github.com/iamdflame/meridian/actions/workflows/ci.yml) · [**Live app**](https://meridian-three-olive.vercel.app) · [**Verify a proof**](https://meridian-three-olive.vercel.app/verify) · [**Hacking-window ledger**](docs/hacking-window.md) · [**Live Cooperate 9/9 receipt**](docs/evidence/live-cooperate-smoke.json) · [**Proof anchor receipt**](https://testnet.monadscan.com/tx/0x35cc7c80fcc15608334b97f26aa56d228214bd3baa597ee668ec2357f297309d) · [**Eight-receipt deployment ledger**](docs/deployments.md)

Deployed: [EligibilityRegistry](https://testnet.monadscan.com/address/0xE9cBAf2d1Ccaf731A3aD85D5A91016a3c17876eb) ([tx](https://testnet.monadscan.com/tx/0x874c489e1c82fb14a43ed2f245891d688c16c5832918fd5b213a793cfc6e12c0)) · [PolicyRegistry](https://testnet.monadscan.com/address/0xe522D342E3355B5cBA1fce3624B4403Ae1f8DED6) ([tx](https://testnet.monadscan.com/tx/0xa034f6e627af9b87f1c0799a9e6379a9945d9e4acf6c945d33635f8b8f3e785e)) · [VerifiedAssetToken](https://testnet.monadscan.com/address/0xebFB3bB4ECDC7a90c3A3067B55c9BaD571629C02) ([tx](https://testnet.monadscan.com/tx/0x84bb258badb5ddaf4c125b70fba3fa4724722b3ce357a15021241c849c2a70a5)) · [SettlementToken](https://testnet.monadscan.com/address/0xD7B06E0C5ffF716c4c92b299fe23e11b03A6Db2f) ([tx](https://testnet.monadscan.com/tx/0x532be9605eec131ea5f3ec588fba6b209736376e647212dddcca08d7d1fe698c)) · [DistributionEngine](https://testnet.monadscan.com/address/0xF38d219607fcb01388cbC90A2f7f3086FE1E89b3) ([tx](https://testnet.monadscan.com/tx/0x50df1f262d86003bb5da4b15296b2b235760b30510f221d47c919d10431a7ecf))

[Concept](docs/01-concept.md) · [Architecture](docs/02-architecture.md) · [Primitive](docs/15-primitive.md) · [Build report](docs/04-build-report.md) · [Deployments](docs/deployments.md)

<img src="docs/assets/banner.png" width="1280" alt="Meridian pre-enactment proofs for verified assets" />

</div>

---

## The problem

Every compliance policy an issuer enacts today is enacted **blind**. Legal writes a memo, ops updates a spreadsheet whitelist, and the desk discovers the blast radius as a breach report four weeks later. On Cleanverse, policy is *executable* — RuleV2 lives inside the asset. But nothing tells an issuer **what a rule will do before it becomes law**, or proves **exactly what it did** afterwards.

## The product — three verbs

1. **SIMULATE** — sweep the entire holder book (and every pending distribution leg) through a draft rule using the exact five-dimensional RuleV2 semantics the chain enforces. Every affected holder, every dollar stranded, every coupon that would fail — before you sign.
2. **ENACT** — one call writes the rule through the real Cleanverse API (`atoken/set_rule`), anchors the version in an on-chain hash chain on Monad, and flips live transfer behavior *at the token layer*: the same transfer that settled a second ago now refuses with the exact rule that blocked it.
3. **PROVE** — export the evidence pack: policy hash chain, affected-holder ledger, per-settlement Travel Rule references. A regulator doesn't trust Meridian — they recompute it.

And the part nobody catches on-camera: distribution legs that strand mid-flight **suspend into escrow** — money caught, not lost — releasable only when the chain re-proves eligibility.

## Why the simulation can be trusted

The TypeScript sweep engine and the Solidity transfer gate implement one semantics, defined once, and **500 seeded differential vectors are executed by both suites in CI** — if either implementation drifts, the build fails ([RuleVectors.t.sol](contracts/test/RuleVectors.t.sol) ↔ [rulev2.ts](packages/sim/src/rulev2.ts)).

## Cleanverse integration (the load-bearing table)

| Primitive | Endpoints / surfaces used | Role |
|---|---|---|
| **CVI** | `generate_apass` (seeds 48 identities), `query_apass`, `query_apass_list`, `verify_apass` (live reconciliation), `update_status` (freeze/reactivate lever), `get_magiclink` (remediation) | The book itself |
| **CVA** | `atoken/set_rule` / `add_rule` / `rules` / `set_paused`, `query_deposit_atoken_list`; full RuleV2 incl. v5.6 country lists | The enactment surface |
| **CCP** | `validator/register` (EIP-191), `validator/rules`; on-chain `checkTransfer` mirrors `complianceVerify` | The verdict layer (differentially proven) |
| **Travel Rule** | `download_travel_rule`, `query_txs` per settled leg | The receipts |
| **Agent Skill Framework** | Meridian **publishes its own skill** ([SKILL.md](server/skill/SKILL.md) + `/api/skills/query_book`, `simulate_policy`, `verify_policy_proof`, `get_evidence`) — the exact pattern of Cleanverse's official `clevrpay` skill. Agents draft and verify; only humans enact | The future seat |
| **Monad** | `PolicyRegistry` (hash-chain anchor), `VerifiedAssetToken` (live-read gate), `DistributionEngine` (suspense escrow), `EligibilityRegistry` (attested mirror) | The proof chain |

**Honesty is architectural:** every response carries `source: live | fixture`; every UI panel wears a provenance chip — `LIVE · SANDBOX`, `LIVE · MONAD`, or `SIMULATED`. The app degrades in labeled steps and never silently fakes.

## Quickstart (works first try, zero credentials)

```bash
git clone https://github.com/iamdflame/meridian && cd meridian
corepack enable && pnpm install

pnpm vitest run                                   # 24 unit tests
node --import tsx server/scripts/e2e-demo-path.ts # full demo path, 24 checks — fixture mode

# contracts (Foundry): install per https://getfoundry.sh, then
curl -sL -o .toolchain/solc-0.8.28 https://binaries.soliditylang.org/linux-amd64/solc-linux-amd64-v0.8.28+commit.7893614a && chmod +x .toolchain/solc-0.8.28
cd contracts && forge test                        # 22 tests + 500-vector differential parity

# full live-chain demo path (local anvil)
anvil --port 8545 &  # then, in another shell:
cd contracts && DEPLOYER_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
cd .. && MONAD_CHAIN_ID=31337 MONAD_RPC=http://127.0.0.1:8545 \
  DEPLOYER_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  node --import tsx server/scripts/e2e-demo-path.ts   # 24/24 with real txs

# the console
node --import tsx server/src/index.ts &   # optional — the web app runs standalone in labeled demo mode without it
cd web && pnpm dev                        # http://localhost:3000
```

With hackathon credentials in `.env` (see `.env.example`), the same code paths run **live** against the Cleanverse sandbox — no code changes, the chips just turn green.

## Verified results

- **24** unit tests (client AES + lifecycle, sweep engine, seed determinism)
- **37** Foundry tests (proof-gated enactment, public consumer, eligibility matrix, policy flip, escrow invariants, identity monotonicity, role separation)
- **500/500** TS↔Solidity differential vectors agree
- **24/24** e2e demo-path checks — in fixture mode *and* full-live-chain mode (real deploy, proof anchor, real reverts with decoded reasons, real escrow release, agent proof verification)
- Live sandbox calls verified today, no credentials needed: `query_chain_config` (Monad 10143, aUSDC `0xaC08…f20D`), `get_magiclink`, `query_deposit_institutions` (Anchorage Digital)

Details with reproduction commands: [docs/04-build-report.md](docs/04-build-report.md) · Monad testnet addresses: [docs/deployments.md](docs/deployments.md)

## Architecture

```mermaid
flowchart LR
    A[Any AI agent] -->|Meridian SKILL.md| S
    W[Console — Next.js 15] --> S[Meridian server]
    S --> C[Cleanverse client<br/>skills live · cooperate live/fixture]
    C --> CV[(Cleanverse sandbox<br/>Cooperate v5.6 + Skills)]
    S --> K[Keeper] --> M[(Monad 10143<br/>PolicyRegistry · VerifiedAssetToken<br/>DistributionEngine · EligibilityRegistry)]
    S --> E[Sim engine<br/>= chain semantics,<br/>500-vector proven]
```

## Why Cleanverse is essential (not decorative)

Remove CVI and there is no book. Remove CVA rule administration and there is nothing to enact. Remove CCP semantics and there is nothing to simulate. Meridian is not an app *gated by* Cleanverse — it is the operating seat *for* Cleanverse's own primitives, the module between the raw API and the institutions it is sold to.

## License

MIT — see [LICENSE](LICENSE).