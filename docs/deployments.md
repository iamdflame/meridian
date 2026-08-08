# Deployments

## Monad Testnet (chain 10143) — LIVE ✓ (deployed 2026-08-08, in hacking window)

Deployer: `0xeCF6C29Ec1DAdBdD66Ecd230ba7171986c6B5B0e` · deploy block **51815571** · [explorer](https://testnet.monadscan.com)

| Contract | Address | Explorer |
|---|---|---|
| EligibilityRegistry | [`0x7e259bd022bef64d1Db3D65e5877C7A005c67B7F`](https://testnet.monadscan.com/address/0x7e259bd022bef64d1Db3D65e5877C7A005c67B7F) | [verify](https://testnet.monadscan.com/address/0x7e259bd022bef64d1Db3D65e5877C7A005c67B7F) |
| PolicyRegistry | [`0xB5C57CD5aB6592ca4FddD516161eDD3ba92BC818`](https://testnet.monadscan.com/address/0xB5C57CD5aB6592ca4FddD516161eDD3ba92BC818) | [verify](https://testnet.monadscan.com/address/0xB5C57CD5aB6592ca4FddD516161eDD3ba92BC818) |
| VerifiedAssetToken (mNOTE) | [`0xD03a96319FB6fB4E702837c14021362e727446c7`](https://testnet.monadscan.com/address/0xD03a96319FB6fB4E702837c14021362e727446c7) | [verify](https://testnet.monadscan.com/address/0xD03a96319FB6fB4E702837c14021362e727446c7) |
| SettlementToken (dUSD) | [`0x40a57A703db976CF008D116AD594aF285F1a92eb`](https://testnet.monadscan.com/address/0x40a57A703db976CF008D116AD594aF285F1a92eb) | [verify](https://testnet.monadscan.com/address/0x40a57A703db976CF008D116AD594aF285F1a92eb) |
| DistributionEngine | [`0x9268aEc817615A79d363e3Bf156AC866eF398327`](https://testnet.monadscan.com/address/0x9268aEc817615A79d363e3Bf156AC866eF398327) | [verify](https://testnet.monadscan.com/address/0x9268aEc817615A79d363e3Bf156AC866eF398327) |

Gas note: deploy consumed ~1.65 MON of the 5 MON faucet; full 48-wallet attest+mint seeding needs ~3 more MON (charged on limit). Writes are idempotent and gated on deployer balance — with <0.05 MON the server keeps the chain live for reads (registry/proof/evidence) and honestly skips writes. **HUMAN ACTION REQUIRED — claim the faucet again for `0xeCF6C29Ec1DAdBdD66Ecd230ba7171986c6B5B0e` (5 MON), then re-run `node --import tsx server/scripts/e2e-demo-path.ts` for the full on-chain demo path.**

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
