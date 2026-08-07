# Deployments

## Monad Testnet (chain 10143) — PENDING FUNDING

Deployer: `0xeCF6C29Ec1DAdBdD66Ecd230ba7171986c6B5B0e` (testnet-only throwaway key, lives in local .env)

> **HUMAN ACTION REQUIRED #2** — the Monad faucet is captcha-gated:
> 1. Open https://faucet.monad.xyz (or https://testnet.monad.xyz) in a browser
> 2. Request MON for `0xeCF6C29Ec1DAdBdD66Ecd230ba7171986c6B5B0e` (5+ MON if tiers offered; deploy+seed needs ~2)
> 3. Then run: `cd contracts && DEPLOYER_KEY=$DEPLOYER_KEY ../.toolchain/forge script script/Deploy.s.sol --rpc-url https://testnet-rpc.monad.xyz --broadcast`
> 4. Addresses land in contracts/deployments/10143.json automatically; paste them into the table below.

| Contract | Address | Explorer |
|---|---|---|
| EligibilityRegistry | _pending_ | |
| PolicyRegistry | _pending_ | |
| VerifiedAssetToken (mNOTE) | _pending_ | |
| SettlementToken (dUSD) | _pending_ | |
| DistributionEngine | _pending_ | |

## Local Anvil (chain 31337) — VERIFIED WORKING

Full-live e2e (deploy → attest 48 holders → fund → mint → enact v2 → transfer flip → coupon suspend/release → evidence) passes: see `server/scripts/e2e-demo-path.ts`. Reproduce:

```bash
.toolchain/anvil --port 8545 &
cd contracts && DEPLOYER_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  ../.toolchain/forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
cd .. && MONAD_CHAIN_ID=31337 MONAD_RPC=http://127.0.0.1:8545 \
  DEPLOYER_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  node --import tsx server/scripts/e2e-demo-path.ts
```

## Cleanverse sandbox reference addresses (recorded live from skills API)

| Item | Address / Value |
|---|---|
| aUSDC (Monad testnet) | `0xaC0893567D43C3E7e6e35a72803df05416C1f20D` |
| A-Pass NFT (EVM chains) | `0xbA82D189540CaC9DC6FF46B6837CaC1BFdEC58B9` |
| Skills API | `https://uatapi.cleanverse.com/api/skills` (live, no auth) |
| Cooperate API | `https://uatapi.cleanverse.com/api/cooperate` (needs registration keys — HUMAN ACTION #1) |
