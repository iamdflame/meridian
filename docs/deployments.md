# Deployments

## Monad Testnet (chain 10143) — PROOF-GATED PRIMITIVE LIVE

Deployed **2026-08-08 06:50:55 UTC** inside the hacking window. Deployer: `0xeCF6C29Ec1DAdBdD66Ecd230ba7171986c6B5B0e` · broadcast start **51885986** · successful receipts **51885991–51886029** · [explorer](https://testnet.monadscan.com)

| Contract | Address | Creation receipt |
|---|---|---|
| EligibilityRegistry | [`0xE9cBAf2d1Ccaf731A3aD85D5A91016a3c17876eb`](https://testnet.monadscan.com/address/0xE9cBAf2d1Ccaf731A3aD85D5A91016a3c17876eb) | [`0x874c…12c0`](https://testnet.monadscan.com/tx/0x874c489e1c82fb14a43ed2f245891d688c16c5832918fd5b213a793cfc6e12c0) · block 51885991 |
| PolicyRegistry | [`0xe522D342E3355B5cBA1fce3624B4403Ae1f8DED6`](https://testnet.monadscan.com/address/0xe522D342E3355B5cBA1fce3624B4403Ae1f8DED6) | [`0xa034…785e`](https://testnet.monadscan.com/tx/0xa034f6e627af9b87f1c0799a9e6379a9945d9e4acf6c945d33635f8b8f3e785e) · block 51885992 |
| VerifiedAssetToken (mNOTE) | [`0xebFB3bB4ECDC7a90c3A3067B55c9BaD571629C02`](https://testnet.monadscan.com/address/0xebFB3bB4ECDC7a90c3A3067B55c9BaD571629C02) | [`0x84bb…70a5`](https://testnet.monadscan.com/tx/0x84bb258badb5ddaf4c125b70fba3fa4724722b3ce357a15021241c849c2a70a5) · block 51885999 |
| SettlementToken (dUSD) | [`0xD7B06E0C5ffF716c4c92b299fe23e11b03A6Db2f`](https://testnet.monadscan.com/address/0xD7B06E0C5ffF716c4c92b299fe23e11b03A6Db2f) | [`0x532b…698c`](https://testnet.monadscan.com/tx/0x532be9605eec131ea5f3ec588fba6b209736376e647212dddcca08d7d1fe698c) · block 51886005 |
| DistributionEngine | [`0xF38d219607fcb01388cbC90A2f7f3086FE1E89b3`](https://testnet.monadscan.com/address/0xF38d219607fcb01388cbC90A2f7f3086FE1E89b3) | [`0x50df…7ecf`](https://testnet.monadscan.com/tx/0x50df1f262d86003bb5da4b15296b2b235760b30510f221d47c919d10431a7ecf) · block 51886011 |

The ordering proof is independently visible in separate receipts:

1. [`grantRole`](https://testnet.monadscan.com/tx/0xb72b81598d1589d7e90c6a625263f30e295fd5afe802494036f52a7804f4c3bb) · block 51886017
2. [`anchorProof`](https://testnet.monadscan.com/tx/0x35cc7c80fcc15608334b97f26aa56d228214bd3baa597ee668ec2357f297309d) · block 51886023
3. [`enact`](https://testnet.monadscan.com/tx/0x4e19a35ca7bd06071352d3ac285d96c6f06af8b39b82e76b6f543cec9d63ad44) · block 51886029

Public `activeProof(keccak256("MERIDIAN-NOTE-1"))` at deployment:

| Field | Value |
|---|---|
| proofHash | `0x1d0029616849c8dbc990f3685d09ad170517e8eb84d6866e30c67ac5d53e36a5` |
| ruleHash | `0x62146085fdd5ffdbbf82cb10e0ff208a897d1e1ed3a3289e05d56caa790d23a1` |
| versionHash | `0x0ea8be6b106115223e3c5b43b6f5f986e0012f1625d291766cba03218c380bc3` |
| affectedHolderCount / strandedValue | `0 / 0` for the baseline policy |
| anchoredAt / enactedAt | `1786171855 / 1786171856` |
| consumed | `true` |

Verified from the public RPC: all eight receipts succeeded, all five addresses have non-empty bytecode, `versionCount(assetId) == 1`, and the active proof is consumed. Raw transactions are committed in [`run-latest.json`](../contracts/broadcast/Deploy.s.sol/10143/run-latest.json). Total paid: **1.09007764937271068 MON**; post-deploy public balance: **3.711663 MON**.

## Superseded pre-primitive deployment (historical)

The first in-window stack remains public and is not hidden: EligibilityRegistry `0x7e259bd022bef64d1Db3D65e5877C7A005c67B7F`, PolicyRegistry `0xB5C57CD5aB6592ca4FddD516161eDD3ba92BC818`, VerifiedAssetToken `0xD03a96319FB6fB4E702837c14021362e727446c7`, SettlementToken `0x40a57A703db976CF008D116AD594aF285F1a92eb`, and DistributionEngine `0x9268aEc817615A79d363e3Bf156AC866eF398327`. Its seven successful receipts are preserved in [`run-1786150399698.json`](../contracts/broadcast/Deploy.s.sol/10143/run-1786150399698.json).

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
