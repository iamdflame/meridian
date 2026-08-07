import { describe, expect, it } from "vitest";
import { CooperateClient } from "../src/cooperate.js";
import { ApassState, VerifyCode } from "../src/types.js";

function fixtureClient(): CooperateClient {
  return new CooperateClient({ base: "https://example.invalid/api/cooperate", allowFixtures: true });
}

const wallet = { address: "0x1111111111111111111111111111111111111111", chain: "monad" };
const input = {
  customerId: "MERIDIANSEED0001",
  subTier: 15,
  subGroup: "MD",
  expirationTime: Math.floor(Date.now() / 1000) + 86_400,
  wallet,
  identityDataList: [{ idType: "PASSPORT", fullName: "Test Holder", issuingCountryISO2: "SG" }],
};

describe("CooperateClient fixture adapter (credential-less mode)", () => {
  it("tags every response as fixture — the honesty invariant", async () => {
    const c = fixtureClient();
    const res = await c.generateApass({ ...input });
    expect(res.source).toBe("fixture");
    expect(res.code).toBe("0000");
  });

  it("full A-Pass lifecycle: generate → verify(valid) → freeze → verify(blocked) → reactivate", async () => {
    const c = fixtureClient();
    await c.generateApass({ ...input });

    const v1 = await c.verifyApass({ chain: "monad", atoken: "0xatoken", address: wallet.address });
    expect(v1.data.code).toBe(VerifyCode.Valid);

    const frozen = await c.updateStatus({ wallet, status: 2, blacklistReason: "sanctions screen hit" });
    expect(frozen.code).toBe("0000");

    const v2 = await c.verifyApass({ chain: "monad", atoken: "0xatoken", address: wallet.address });
    expect(v2.data.code).toBe(VerifyCode.ApassBlocked);
    expect(v2.data.magickLink).toBeTruthy(); // remediation path offered on block

    await c.updateStatus({ wallet, status: 1 });
    const rec = await c.queryApass({ chain: "monad", address: wallet.address });
    expect(rec.data.state).toBe(ApassState.Active);
  });

  it("expired credentials verify as blocked, not missing", async () => {
    const c = fixtureClient();
    await c.generateApass({ ...input, expirationTime: Math.floor(Date.now() / 1000) - 10 });
    const v = await c.verifyApass({ chain: "monad", atoken: "0xatoken", address: wallet.address });
    expect(v.data.code).toBe(VerifyCode.ApassBlocked);
  });

  it("unknown wallets verify as NoApass", async () => {
    const c = fixtureClient();
    const v = await c.verifyApass({ chain: "monad", atoken: "0xatoken", address: "0xdead" });
    expect(v.data.code).toBe(VerifyCode.NoApass);
  });

  it("A-Token rule administration round-trips (set_rule is the ENACT write)", async () => {
    const c = fixtureClient();
    const atoken = "0x2222222222222222222222222222222222222222";
    const rule = { group: "", subGroup: "", minTier: 30, minSubTier: 0, countries: ["KP", "IR"], isBlackList: true };
    await c.atokenSetRule({ chain: "monad", atoken, rules: [rule] });
    const rules = await c.atokenRules({ chain: "monad", atoken });
    expect(rules.data).toHaveLength(1);
    expect(rules.data[0]?.minTier).toBe(30);
  });

  it("validator pool registration is queryable", async () => {
    const c = fixtureClient();
    const pool = "0x3333333333333333333333333333333333333333";
    await c.validatorRegister({
      chain: "monad",
      contractAddress: pool,
      rule: { group: "", subGroup: "", minTier: 10, minSubTier: 0, countries: [], isBlackList: true },
      ownerSignature: "0xsig",
    });
    const reg = await c.validatorIsRegister({ chain: "monad", contractAddress: pool });
    expect(reg.data.registered).toBe(true);
  });

  it("throws loudly when credentials absent and fixtures disabled", async () => {
    const c = new CooperateClient({ base: "https://example.invalid", allowFixtures: false });
    await expect(c.queryApassList()).rejects.toThrow(/fixtures disabled/);
  });
});
