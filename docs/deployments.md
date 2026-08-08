# Deployments

## Monad Testnet (chain 10143) — LIVE ✓ (deployed 2026-08-08, in hacking window)

Deployer: `0xeCF6C29Ec1DAdBdD66Ecd230ba7171986c6B5B0e` · broadcast started at block **51815571** · successful receipt range **51815577–51815607** · [explorer](https://testnet.monadscan.com)

| Contract | Address | Creation receipt |
|---|---|---|
| EligibilityRegistry | [`0x7e259bd022bef64d1Db3D65e5877C7A005c67B7F`](https://testnet.monadscan.com/address/0x7e259bd022bef64d1Db3D65e5877C7A005c67B7F) | [`0xae40…d2de`](https://testnet.monadscan.com/tx/0xae4017b29918e3eea653edf898837332077e618621748a7f27d028a3fa61d2de) · block 51815577 |
| PolicyRegistry | [`0xB5C57CD5aB6592ca4FddD516161eDD3ba92BC818`](https://testnet.monadscan.com/address/0xB5C57CD5aB6592ca4FddD516161eDD3ba92BC818) | [`0x5dd9…8e52`](https://testnet.monadscan.com/tx/0x5dd951bba1b196de9afc7ec2ccb6cab7c0a2b1d739db9f7b76a1d6117c758e52) · block 51815582 |
| VerifiedAssetToken (mNOTE) | [`0xD03a96319FB6fB4E702837c14021362e727446c7`](https://testnet.monadscan.com/address/0xD03a96319FB6fB4E702837c14021362e727446c7) | [`0xc3cf…265b`](https://testnet.monadscan.com/tx/0xc3cf961ce639bc447fb86c80c46e95b17234ec5de36a3fb106ed261a0195265b) · block 51815583 |
| SettlementToken (dUSD) | [`0x40a57A703db976CF008D116AD594aF285F1a92eb`](https://testnet.monadscan.com/address/0x40a57A703db976CF008D116AD594aF285F1a92eb) | [`0xeab5…ea48`](https://testnet.monadscan.com/tx/0xeab5c44fbe46e045dd53d507b9c47f7d205a4aeaec7e8c1b7133876038f3ea48) · block 51815590 |
| DistributionEngine | [`0x9268aEc817615A79d363e3Bf156AC866eF398327`](https://testnet.monadscan.com/address/0x9268aEc817615A79d363e3Bf156AC866eF398327) | [`0xb902…1299`](https://testnet.monadscan.com/tx/0xb902eb8bc2fba0670372706bc0cba56bd86cf8dafb59b9d061bc361c09451299) · block 51815595 |

Post-deployment configuration is independently visible: [`grantRole`](https://testnet.monadscan.com/tx/0x2d334861b636e4844ebe3284c630804bb68b600195e40646070d8ef34dd2a700) at block 51815601 and the [`v1 baseline policy enactment`](https://testnet.monadscan.com/tx/0x6a7fa416839357512000d78b68b5883b4c2c342318cbecf4dc441e87719115d0) at block 51815607.

Verified 2026-08-08: all seven receipts return status `0x1` from the public Monad RPC, all five addresses contain non-empty bytecode, and every address/transaction link above returns HTTP 200. Raw receipt data is committed in [`contracts/broadcast/Deploy.s.sol/10143/run-latest.json`](../contracts/broadcast/Deploy.s.sol/10143/run-latest.json).

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
