import type { SimHolder, SimRule } from "@meridian/sim";
import { Reason } from "@meridian/sim";

export interface HolderRow extends SimHolder {
  wallet: string;
  name: string;
  customerId: string;
  /** face units of the asset (6dp) */
  position: bigint;
  /** provenance of this row's credential state */
  source: "live" | "fixture";
}

export interface PolicyVersion {
  version: number;
  rule: SimRule;
  memo: string;
  enactedAt: number;
  /** on-chain anchor */
  versionHash?: string;
  parentHash?: string;
  anchorTx?: string;
  /** cleanverse write evidence */
  cleanverse: { source: "live" | "fixture"; txHash?: string };
}

export interface DistributionLeg {
  wallet: string;
  amount: bigint;
  state: "pending" | "paid" | "suspended" | "released";
  reason: Reason;
  txHash?: string;
  travelRule?: { source: "live" | "fixture"; url?: string };
}

export interface DistributionRun {
  id: number;
  memo: string;
  createdAt: number;
  onchainRunId?: number;
  legs: DistributionLeg[];
}

export interface AuditEvent {
  at: number;
  kind:
    | "seed"
    | "sync"
    | "sweep"
    | "enact"
    | "freeze"
    | "reactivate"
    | "distribution:create"
    | "distribution:pay"
    | "distribution:release"
    | "proof:transfer";
  detail: Record<string, unknown>;
}

/** The issuer's book — single in-memory source of truth for the console. */
export class BookStore {
  holders = new Map<string, HolderRow>(); // key: wallet lowercase
  policies: PolicyVersion[] = [];
  distributions: DistributionRun[] = [];
  events: AuditEvent[] = [];
  assetId = "MERIDIAN-NOTE-1";

  activePolicy(): PolicyVersion | undefined {
    return this.policies[this.policies.length - 1];
  }

  upsertHolder(row: HolderRow): void {
    this.holders.set(row.wallet.toLowerCase(), row);
  }

  holder(wallet: string): HolderRow | undefined {
    return this.holders.get(wallet.toLowerCase());
  }

  list(): HolderRow[] {
    return [...this.holders.values()];
  }

  log(kind: AuditEvent["kind"], detail: Record<string, unknown>): void {
    this.events.push({ at: Date.now(), kind, detail });
  }
}

export const REASON_KEY: Record<Reason, string> = {
  [Reason.None]: "eligible",
  [Reason.PolicyInactive]: "policy_inactive",
  [Reason.NotRegistered]: "not_registered",
  [Reason.CredentialFrozen]: "frozen",
  [Reason.CredentialExpired]: "expired",
  [Reason.GroupMismatch]: "group",
  [Reason.SubGroupMismatch]: "subgroup",
  [Reason.TierTooLow]: "tier",
  [Reason.SubTierTooLow]: "subtier",
  [Reason.IneligibleCountry]: "country",
};
