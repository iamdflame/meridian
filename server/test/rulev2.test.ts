import { describe, expect, it } from "vitest";
import { Reason, evaluate, generateVectors } from "@meridian/sim";

describe("RuleV2 TS engine", () => {
  it("agrees with itself across regeneration (deterministic vectors)", () => {
    const a = generateVectors(500);
    const b = generateVectors(500);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("covers every refusal reason in the vector set (no vacuous suite)", () => {
    const seen = new Set(generateVectors(500).map((v) => v.expected));
    for (const reason of [
      Reason.None,
      Reason.PolicyInactive,
      Reason.NotRegistered,
      Reason.CredentialFrozen,
      Reason.CredentialExpired,
      Reason.TierTooLow,
      Reason.IneligibleCountry,
    ]) {
      expect(seen, `reason ${Reason[reason]} must appear in vectors`).toContain(reason);
    }
  });

  it("check order: frozen beats expiry beats tier", () => {
    const h = {
      cvRecordId: "x",
      tier: 0,
      subTier: 0,
      group: "AB",
      subGroup: "AB",
      country: "SG",
      status: 2,
      expiry: 0,
      exists: true,
    };
    const r = { group: "", subGroup: "", minTier: 99, minSubTier: 0, countries: [], isBlackList: true, active: true };
    expect(evaluate(h, r, 1000)).toBe(Reason.CredentialFrozen);
    expect(evaluate({ ...h, status: 1 }, r, 1000)).toBe(Reason.CredentialExpired);
    expect(evaluate({ ...h, status: 1, expiry: 2000 }, r, 1000)).toBe(Reason.TierTooLow);
  });

  it("empty allow-list means any country; empty blacklist blocks nothing", () => {
    const h = {
      cvRecordId: "x",
      tier: 50,
      subTier: 50,
      group: "AB",
      subGroup: "AB",
      country: "KP",
      status: 1,
      expiry: 2000,
      exists: true,
    };
    expect(evaluate(h, { group: "", subGroup: "", minTier: 0, minSubTier: 0, countries: [], isBlackList: false, active: true }, 1000)).toBe(Reason.None);
    expect(evaluate(h, { group: "", subGroup: "", minTier: 0, minSubTier: 0, countries: [], isBlackList: true, active: true }, 1000)).toBe(Reason.None);
  });
});
