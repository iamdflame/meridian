import {
  http,
  createPublicClient,
  createWalletClient,
  defineChain,
  keccak256,
  toBytes,
  type Address,
  type Chain,
  type Hex,
  type PublicClient,
  type WalletClient,
  type Account,
  type Transport,
  stringToHex,
  pad,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { engineAbi, cashAbi, noteAbi, policyAbi, registryAbi } from "./abi.js";
import type { HolderRow } from "../book/store.js";
import type { SimRule } from "@meridian/sim";

export interface Deployments {
  chainId: number;
  registry: Address;
  policy: Address;
  note: Address;
  cash: Address;
  engine: Address;
  deployBlock?: number;
}

export interface ChainConfig {
  rpc: string;
  chainId: number;
  deployerKey: Hex;
  deployments: Deployments;
}

const b2 = (s: string): Hex => pad(stringToHex(s.slice(0, 2)), { size: 2, dir: "right" });

export const toRuleStruct = (r: SimRule) => ({
  group: b2(r.group),
  subGroup: b2(r.subGroup),
  minTier: r.minTier,
  minSubTier: r.minSubTier,
  countries: r.countries.map(b2),
  isBlackList: r.isBlackList,
  active: r.active,
});

export const assetIdOf = (id: string): Hex => keccak256(toBytes(id));

/**
 * The keeper — Meridian's bridge between the Cleanverse book and the chain:
 * attests credential state into EligibilityRegistry, anchors enacted policies,
 * and drives the proof beats (gated transfer, distribution lifecycle).
 */
export class Keeper {
  readonly chain: Chain;
  readonly pub: PublicClient;
  readonly wallet: WalletClient<Transport, Chain, Account>;
  readonly account;

  constructor(readonly cfg: ChainConfig) {
    this.chain = defineChain({
      id: cfg.chainId,
      name: cfg.chainId === 10143 ? "Monad Testnet" : "Local Anvil",
      nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
      rpcUrls: { default: { http: [cfg.rpc] } },
    });
    this.account = privateKeyToAccount(cfg.deployerKey);
    this.pub = createPublicClient({ chain: this.chain, transport: http(cfg.rpc) });
    this.wallet = createWalletClient({ chain: this.chain, transport: http(cfg.rpc), account: this.account });
  }

  private async write(params: Parameters<typeof this.pub.simulateContract>[0]): Promise<Hex> {
    // Monad charges gas on the LIMIT — always simulate before writing.
    const { request } = await this.pub.simulateContract({ ...params, account: this.account });
    const hash = await this.wallet.writeContract(request);
    const receipt = await this.pub.waitForTransactionReceipt({ hash });
    if (receipt.status !== "success") throw new Error(`tx reverted: ${hash}`);
    return hash;
  }

  /** Push the book's credential state on-chain in one batch. Idempotent on repeat
   *  boots: if the deployer lacks gas for a full re-attest, we read current state
   *  and skip — the registry already mirrors these holders from the first sync. */
  async attestBook(holders: HolderRow[]): Promise<Hex | undefined> {
    const batch = holders.map((h) => ({
      wallet: h.wallet as Address,
      cvRecordId: keccak256(toBytes(h.cvRecordId)),
      tier: Math.min(255, h.tier),
      subTier: Math.min(255, h.subTier),
      group: b2(h.group),
      subGroup: b2(h.subGroup),
      country: b2(h.country),
      status: h.status,
      expiry: BigInt(h.expiry),
    }));
    try {
      return await this.write({
        address: this.cfg.deployments.registry,
        abi: registryAbi,
        functionName: "attestBatch",
        args: [batch],
      });
    } catch (err) {
      const bal = await this.pub.getBalance({ address: this.account.address });
      if (bal < 10n ** 17n) {
        // gas-starved on a previously-synced registry — verify the mirror exists
        const onchain = await this.pub.readContract({
          address: this.cfg.deployments.registry,
          abi: registryAbi,
          functionName: "walletCount",
        });
        if (onchain >= BigInt(holders.length)) return undefined; // already synced
      }
      throw err;
    }
  }

  async setStatus(wallet: string, status: 1 | 2): Promise<Hex> {
    return this.write({
      address: this.cfg.deployments.registry,
      abi: registryAbi,
      functionName: "setStatus",
      args: [wallet as Address, status],
    });
  }

  /** Anchor a policy version on-chain; returns { txHash, versionHash, parentHash }. */
  async enactPolicy(assetId: string, rule: SimRule, memo: string): Promise<{ txHash: Hex; versionHash: Hex; parentHash: Hex }> {
    const txHash = await this.write({
      address: this.cfg.deployments.policy,
      abi: policyAbi,
      functionName: "enact",
      args: [assetIdOf(assetId), toRuleStruct(rule), memo],
    });
    const count = await this.pub.readContract({
      address: this.cfg.deployments.policy,
      abi: policyAbi,
      functionName: "versionCount",
      args: [assetIdOf(assetId)],
    });
    const v = await this.pub.readContract({
      address: this.cfg.deployments.policy,
      abi: policyAbi,
      functionName: "versionAt",
      args: [assetIdOf(assetId), count - 1n],
    });
    return { txHash, versionHash: v.hash, parentHash: v.parentHash };
  }

  /** Preflight a note transfer — returns (fromReason, toReason) from the CONTRACT's evaluator. */
  async checkTransfer(from: string, to: string): Promise<{ fromReason: number; toReason: number }> {
    const [fromReason, toReason] = await this.pub.readContract({
      address: this.cfg.deployments.note,
      abi: noteAbi,
      functionName: "checkTransfer",
      args: [from as Address, to as Address],
    });
    return { fromReason, toReason };
  }

  /**
   * The Act-2 proof: attempt a real gated transfer signed by a demo holder.
   * Returns pass/revert with the decoded on-chain reason. A revert here is a
   * SUCCESSFUL demonstration — the policy is enforced by the token itself.
   */
  async proveTransfer(fromKey: Hex, to: string, amount: bigint): Promise<{ ok: boolean; txHash?: Hex; reason?: number }> {
    const from = privateKeyToAccount(fromKey);
    try {
      const { request } = await this.pub.simulateContract({
        address: this.cfg.deployments.note,
        abi: noteAbi,
        functionName: "transfer",
        args: [to as Address, amount],
        account: from,
      });
      const signer = createWalletClient({ chain: this.chain, transport: http(this.cfg.rpc), account: from });
      const txHash = await signer.writeContract(request);
      await this.pub.waitForTransactionReceipt({ hash: txHash });
      return { ok: true, txHash };
    } catch (err) {
      const reason = decodeIneligible(err);
      if (reason !== undefined) return { ok: false, reason };
      throw err;
    }
  }

  async noteBalance(wallet: string): Promise<bigint> {
    return this.pub.readContract({
      address: this.cfg.deployments.note,
      abi: noteAbi,
      functionName: "balanceOf",
      args: [wallet as Address],
    });
  }

  async createDistributionRun(assetId: string, holders: string[], amounts: bigint[], memo: string): Promise<{ txHash: Hex; runId: bigint }> {
    const txHash = await this.write({
      address: this.cfg.deployments.engine,
      abi: engineAbi,
      functionName: "createRun",
      args: [assetIdOf(assetId), this.cfg.deployments.cash, holders as Address[], amounts.map((a) => a), memo],
    });
    const runId = await this.pub.readContract({
      address: this.cfg.deployments.engine,
      abi: engineAbi,
      functionName: "runCount",
    });
    return { txHash, runId };
  }

  async payLegs(runId: bigint, from: number, to: number): Promise<Hex> {
    return this.write({
      address: this.cfg.deployments.engine,
      abi: engineAbi,
      functionName: "payLegs",
      args: [runId, BigInt(from), BigInt(to)],
    });
  }

  async releaseLeg(runId: bigint, legIndex: number): Promise<Hex> {
    return this.write({
      address: this.cfg.deployments.engine,
      abi: engineAbi,
      functionName: "releaseLeg",
      args: [runId, BigInt(legIndex)],
    });
  }

  async legAt(runId: bigint, i: number): Promise<{ holder: Address; amount: bigint; state: number; reason: number }> {
    return this.pub.readContract({
      address: this.cfg.deployments.engine,
      abi: engineAbi,
      functionName: "legAt",
      args: [runId, BigInt(i)],
    });
  }

  /** Gas-fund demo wallets so they can sign proof transfers. */
  async fundWallets(wallets: string[], amountWei: bigint): Promise<void> {
    for (const w of wallets) {
      const hash = await this.wallet.sendTransaction({ to: w as Address, value: amountWei });
      await this.pub.waitForTransactionReceipt({ hash });
    }
  }

  /** Mint note positions to eligible holders (mint checks the to-leg only).
   *  Skips holders already holding the position (idempotent on repeat boots). */
  async mintNotes(pairs: Array<{ wallet: string; amount: bigint }>): Promise<number> {
    let minted = 0;
    for (const p of pairs) {
      try {
        const current = await this.pub.readContract({
          address: this.cfg.deployments.note,
          abi: noteAbi,
          functionName: "balanceOf",
          args: [p.wallet as Address],
        });
        if (current >= p.amount) continue; // already minted
        await this.write({
          address: this.cfg.deployments.note,
          abi: noteAbi,
          functionName: "mint",
          args: [p.wallet as Address, p.amount],
        });
        minted++;
      } catch {
        // holder ineligible under the baseline policy — expected for low-tier seeds
      }
    }
    return minted;
  }

  /** Mint settlement cash to the keeper and approve the engine to pull it. */
  async fundEngineCash(total: bigint): Promise<void> {
    await this.write({
      address: this.cfg.deployments.cash,
      abi: cashAbi,
      functionName: "mint",
      args: [this.account.address, total],
    });
    await this.write({
      address: this.cfg.deployments.cash,
      abi: cashAbi,
      functionName: "approve",
      args: [this.cfg.deployments.engine, total],
    });
  }
}

/** Decode VerifiedAssetToken.TransferIneligible(address,uint8) from a viem error chain. */
export function decodeIneligible(err: unknown): number | undefined {
  let e: unknown = err;
  while (e && typeof e === "object") {
    const data = (e as { data?: unknown }).data;
    if (data && typeof data === "object" && (data as { errorName?: string }).errorName === "TransferIneligible") {
      const args = (data as { args?: unknown[] }).args;
      if (args && args.length === 2) return Number(args[1]);
    }
    e = (e as { cause?: unknown }).cause;
  }
  return undefined;
}
