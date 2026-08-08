import { Reason, evaluate, hashProofPayload, type SimRule } from "@meridian/sim";
import type { Hex } from "viem";
import type { BookStore } from "../book/store.js";

export interface HolderImpact {
  wallet: string;
  name: string;
  cvRecordId: string;
  tier: number;
  country: string;
  position: string; // bigint as string for JSON
  before: Reason;
  after: Reason;
  becameIneligible: boolean;
  becameEligible: boolean;
}

export interface SweepResult {
  assetId: string;
  at: number;
  draft: SimRule;
  baselineVersion: number;
  holders: HolderImpact[];
  aggregates: {
    holderCount: number;
    eligibleBefore: number;
    eligibleAfter: number;
    newlyIneligible: number;
    newlyEligible: number;
    strandedValue: string; // total position value of newly-ineligible holders
    strandedPendingLegs: number; // distribution legs that would suspend under the draft
    strandedPendingValue: string;
    reasonsAfter: Record<string, number>;
  };
}

/** Content address for the exact public sweep captured before enactment. */
export function hashSweepProof(result: SweepResult): Hex {
  return hashProofPayload(result);
}

/**
 * The differential sweep: evaluate every holder (and every pending distribution leg)
 * under the active policy and under the draft, and report exactly what changes.
 * Pure computation over the book — the same semantics the chain enforces, proven by
 * the 500-vector differential suite.
 */
export function sweep(book: BookStore, draft: SimRule, nowTs = Math.floor(Date.now() / 1000)): SweepResult {
  const active = book.activePolicy();
  const baseline: SimRule = active?.rule ?? { group: "", subGroup: "", minTier: 0, minSubTier: 0, countries: [], isBlackList: true, active: true };

  const holders: HolderImpact[] = [];
  let eligibleBefore = 0;
  let eligibleAfter = 0;
  let newlyIneligible = 0;
  let newlyEligible = 0;
  let strandedValue = 0n;
  const reasonsAfter: Record<string, number> = {};

  for (const h of book.list()) {
    const before = evaluate(h, baseline, nowTs);
    const after = evaluate(h, draft, nowTs);
    if (before === Reason.None) eligibleBefore++;
    if (after === Reason.None) eligibleAfter++;
    const becameIneligible = before === Reason.None && after !== Reason.None;
    const becameEligible = before !== Reason.None && after === Reason.None;
    if (becameIneligible) {
      newlyIneligible++;
      strandedValue += h.position;
    }
    if (becameEligible) newlyEligible++;
    if (after !== Reason.None) {
      const k = Reason[after];
      reasonsAfter[k] = (reasonsAfter[k] ?? 0) + 1;
    }
    holders.push({
      wallet: h.wallet,
      name: h.name,
      cvRecordId: h.cvRecordId,
      tier: h.tier,
      country: h.country,
      position: h.position.toString(),
      before,
      after,
      becameIneligible,
      becameEligible,
    });
  }

  // Pending distribution legs that would suspend under the draft.
  let strandedPendingLegs = 0;
  let strandedPendingValue = 0n;
  for (const run of book.distributions) {
    for (const leg of run.legs) {
      if (leg.state !== "pending") continue;
      const h = book.holder(leg.wallet);
      if (!h) continue;
      if (evaluate(h, draft, nowTs) !== Reason.None) {
        strandedPendingLegs++;
        strandedPendingValue += leg.amount;
      }
    }
  }

  return {
    assetId: book.assetId,
    at: nowTs,
    draft,
    baselineVersion: active?.version ?? 0,
    holders,
    aggregates: {
      holderCount: holders.length,
      eligibleBefore,
      eligibleAfter,
      newlyIneligible,
      newlyEligible,
      strandedValue: strandedValue.toString(),
      strandedPendingLegs,
      strandedPendingValue: strandedPendingValue.toString(),
      reasonsAfter,
    },
  };
}
