import type { BookStore, PolicyVersion } from "./book/store.js";
import type { SweepResult } from "./sim/sweep.js";

export interface EvidencePack {
  product: "meridian";
  assetId: string;
  generatedAt: number;
  policy: {
    version: number;
    memo: string;
    rule: PolicyVersion["rule"];
    enactedAt: number;
    cleanverseWrite: PolicyVersion["cleanverse"];
    onchainAnchor: {
      proofHash?: string;
      proofTxHash?: string;
      enactTxHash?: string;
      versionHash?: string;
      parentHash?: string;
    };
  };
  /** the differential sweep captured at enactment — the blast radius as enacted */
  sweepAtEnactment?: SweepResult;
  holdersAffected: Array<{
    wallet: string;
    name: string;
    cvRecordId: string;
    before: number;
    after: number;
    position: string;
  }>;
  distributions: Array<{
    runId: number;
    memo: string;
    legs: Array<{
      wallet: string;
      amount: string;
      state: string;
      reason: number;
      txHash?: string;
      travelRule?: { source: string; url?: string };
    }>;
  }>;
  auditTrail: Array<{ at: number; kind: string; detail: Record<string, unknown> }>;
  verification: {
    note: string;
    how: string[];
  };
}

const enactmentSweeps = new Map<number, SweepResult>();

export function recordEnactmentSweep(version: number, sweep: SweepResult): void {
  enactmentSweeps.set(version, sweep);
}

export function buildEvidence(book: BookStore, version: number): EvidencePack | undefined {
  const policy = book.policies.find((p) => p.version === version);
  if (!policy) return undefined;
  const sweep = enactmentSweeps.get(version);

  return {
    product: "meridian",
    assetId: book.assetId,
    generatedAt: Date.now(),
    policy: {
      version: policy.version,
      memo: policy.memo,
      rule: policy.rule,
      enactedAt: policy.enactedAt,
      cleanverseWrite: policy.cleanverse,
      onchainAnchor: {
        ...(policy.proofHash !== undefined ? { proofHash: policy.proofHash } : {}),
        ...(policy.proofTx !== undefined ? { proofTxHash: policy.proofTx } : {}),
        ...(policy.enactTx !== undefined ? { enactTxHash: policy.enactTx } : {}),
        ...(policy.versionHash !== undefined ? { versionHash: policy.versionHash } : {}),
        ...(policy.parentHash !== undefined ? { parentHash: policy.parentHash } : {}),
      },
    },
    ...(sweep ? { sweepAtEnactment: sweep } : {}),
    holdersAffected: (sweep?.holders ?? [])
      .filter((h) => h.becameIneligible || h.becameEligible)
      .map((h) => ({
        wallet: h.wallet,
        name: h.name,
        cvRecordId: h.cvRecordId,
        before: h.before,
        after: h.after,
        position: h.position,
      })),
    distributions: book.distributions.map((d) => ({
      runId: d.id,
      memo: d.memo,
      legs: d.legs.map((l) => ({
        wallet: l.wallet,
        amount: l.amount.toString(),
        state: l.state,
        reason: l.reason,
        ...(l.txHash !== undefined ? { txHash: l.txHash } : {}),
        ...(l.travelRule !== undefined ? { travelRule: l.travelRule } : {}),
      })),
    })),
    auditTrail: book.events.map((e) => ({ at: e.at, kind: e.kind, detail: e.detail })),
    verification: {
      note: "Every on-chain hash in this pack is independently verifiable.",
      how: [
        "Recompute proofHash as keccak256 of sweepAtEnactment encoded as canonical JSON (object keys sorted recursively).",
        "PolicyRegistry.proofAt(assetId, n) returns the proof digest, impact metrics, rule hash, and parent lineage anchored before enactment.",
        "PolicyRegistry.versionAt(assetId, n) returns (hash, parentHash, proofHash, enactedAt, memo); recompute keccak256(parent ‖ assetId ‖ encodedRule ‖ proofHash ‖ timestamp) to verify the chain.",
        "VerifiedAssetToken.checkTransfer(from, to) reproduces any eligibility verdict in this pack from public state.",
        "DistributionEngine.legAt(runId, i) returns each leg's state and refusal reason on-chain.",
        "Cleanverse writes marked live carry sandbox API evidence; writes marked fixture are honestly labeled simulations.",
      ],
    },
  };
}
