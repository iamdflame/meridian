/**
 * One-time Monad seeding for the live demo: fund 48 demo wallets with gas,
 * mint their note positions, and fund the coupon engine. Gas is heavy on Monad
 * (charged on limit) — 0.05 MON per wallet, idempotent (skips funded wallets).
 *   node --import tsx server/scripts/seed-chain.ts
 */
import { readFileSync } from "node:fs";
import { http, createPublicClient, createWalletClient, defineChain, parseEther, type Address, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { demoWallet } from "../src/chain/wallets.js";
import { cashAbi } from "../src/chain/abi.js";
import type { Deployments } from "../src/chain/keeper.js";

const RPC = process.env.MONAD_RPC ?? "https://testnet-rpc.monad.xyz";
const KEY = process.env.DEPLOYER_KEY as Hex;
const chainId = process.env.MONAD_CHAIN_ID ?? "10143";
const dep = JSON.parse(readFileSync(new URL(`../../contracts/deployments/${chainId}.json`, import.meta.url), "utf8")) as Deployments;

const chain = defineChain({
  id: dep.chainId,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
});
const account = privateKeyToAccount(KEY);
const pub = createPublicClient({ chain, transport: http(RPC) });
const wallet = createWalletClient({ chain, transport: http(RPC), account });

async function send(to: Address, value: bigint): Promise<void> {
  const hash = await wallet.sendTransaction({ to, value });
  const r = await pub.waitForTransactionReceipt({ hash });
  if (r.status !== "success") throw new Error(`funding ${to} failed`);
}

const PROOF_INDICES = [0, 1, 2, 3, 4, 5, 27, 33]; // senders/recipients used by prove-transfer beats + coupon leaders

const bal = await pub.getBalance({ address: account.address });
console.log(`deployer ${account.address} balance: ${Number(bal) / 1e18} MON`);
const per = parseEther("0.02");
const needed = per * BigInt(PROOF_INDICES.length);
if (bal < needed + parseEther("1")) throw new Error(`insufficient MON for seeding (need ~${Number(needed) / 1e18 + 1})`);

for (const i of PROOF_INDICES) {
  const w = demoWallet(i) as Address;
  const have = await pub.getBalance({ address: w });
  if (have > 0n) continue;
  await send(w, per);
  process.stdout.write(`${i} `);
}
console.log("proof wallets funded");

const total = 100_000n * 10n ** 6n;
const mintHash = await wallet.writeContract({ address: dep.cash, abi: cashAbi, functionName: "mint", args: [account.address, total] });
await pub.waitForTransactionReceipt({ hash: mintHash });
const apHash = await wallet.writeContract({ address: dep.cash, abi: cashAbi, functionName: "approve", args: [dep.engine, total] });
await pub.waitForTransactionReceipt({ hash: apHash });
console.log("engine cash funded + approved (100k dUSD)");
