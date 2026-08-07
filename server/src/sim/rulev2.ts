/**
 * RuleV2 evaluation — the TypeScript twin of contracts/src/lib/RuleV2Lib.sol.
 * Check ORDER is part of the contract between the two implementations:
 *   registration → status → expiry → group → subGroup → tier → subTier → country.
 * Parity is enforced by the shared vector suite (sim/vectors.json) executed by BOTH
 * vitest (this file) and Foundry (contracts/test/RuleVectors.t.sol).
 */

export const STATUS_ACTIVE = 1;
export const STATUS_FROZEN = 2;

export interface SimHolder {
  cvRecordId: string;
  tier: number;
  subTier: number;
  group: string; // "" or 1–2 chars
  subGroup: string;
  country: string; // ISO2
  status: number; // 1 active, 2 frozen
  expiry: number; // unix seconds
  exists: boolean;
}

export interface SimRule {
  group: string; // "" = any
  subGroup: string; // "" = any
  minTier: number;
  minSubTier: number;
  countries: string[];
  isBlackList: boolean;
  active: boolean;
}

export enum Reason {
  None = 0,
  PolicyInactive = 1,
  NotRegistered = 2,
  CredentialFrozen = 3,
  CredentialExpired = 4,
  GroupMismatch = 5,
  SubGroupMismatch = 6,
  TierTooLow = 7,
  SubTierTooLow = 8,
  IneligibleCountry = 9,
}

export const REASON_LABEL: Record<Reason, string> = {
  [Reason.None]: "Eligible",
  [Reason.PolicyInactive]: "Policy inactive",
  [Reason.NotRegistered]: "No verified credential",
  [Reason.CredentialFrozen]: "Credential frozen",
  [Reason.CredentialExpired]: "Credential expired",
  [Reason.GroupMismatch]: "Group not permitted",
  [Reason.SubGroupMismatch]: "Sub-group not permitted",
  [Reason.TierTooLow]: "Verification tier below minimum",
  [Reason.SubTierTooLow]: "Sub-tier below minimum",
  [Reason.IneligibleCountry]: "Jurisdiction not permitted",
};

export function evaluate(h: SimHolder, r: SimRule, nowTs: number): Reason {
  if (!r.active) return Reason.PolicyInactive;
  if (!h.exists) return Reason.NotRegistered;
  if (h.status !== STATUS_ACTIVE) return Reason.CredentialFrozen;
  if (h.expiry < nowTs) return Reason.CredentialExpired;
  if (r.group !== "" && h.group !== r.group) return Reason.GroupMismatch;
  if (r.subGroup !== "" && h.subGroup !== r.subGroup) return Reason.SubGroupMismatch;
  if (h.tier < r.minTier) return Reason.TierTooLow;
  if (h.subTier < r.minSubTier) return Reason.SubTierTooLow;
  if (r.countries.length > 0) {
    const listed = r.countries.includes(h.country);
    if (r.isBlackList && listed) return Reason.IneligibleCountry;
    if (!r.isBlackList && !listed) return Reason.IneligibleCountry;
  }
  return Reason.None;
}
