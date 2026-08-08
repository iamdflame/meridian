import { beforeAll, describe, expect, it } from "vitest";
import { CooperateClient } from "@meridian/cleanverse";
import { BookStore } from "../src/book/store.js";
import { seedBook } from "../src/book/seed.js";
import { hashSweepProof, sweep } from "../src/sim/sweep.js";
import { Reason } from "@meridian/sim";

const book = new BookStore();

beforeAll(async () => {
  const cooperate = new CooperateClient({ base: "https://example.invalid", allowFixtures: true });
  await seedBook(book, cooperate, { count: 48 });
});

describe("seeded book", () => {
  it("seeds 48 holders through the cooperate surface with fixture provenance", () => {
    expect(book.holders.size).toBe(48);
    expect(book.list().every((h) => h.source === "fixture")).toBe(true);
  });

  it("has frozen holders, a baseline policy, and a pending coupon run", () => {
    expect(book.list().filter((h) => h.status === 2).length).toBe(2);
    expect(book.activePolicy()?.version).toBe(1);
    expect(book.distributions[0]?.legs.length).toBe(12);
  });

  it("is deterministic across reseeds", async () => {
    const book2 = new BookStore();
    await seedBook(book2, new CooperateClient({ base: "https://example.invalid", allowFixtures: true }), { count: 48 });
    expect(book2.list().map((h) => [h.wallet, h.tier, h.country, h.position.toString()])).toEqual(
      book.list().map((h) => [h.wallet, h.tier, h.country, h.position.toString()]),
    );
  });
});

describe("differential sweep", () => {
  it("identity draft (same rule) changes nothing", () => {
    const active = book.activePolicy()!.rule;
    const r = sweep(book, { ...active });
    expect(r.aggregates.newlyIneligible).toBe(0);
    expect(r.aggregates.newlyEligible).toBe(0);
  });

  it("KP/IR blacklist strands exactly the KP+IR holders who were eligible", () => {
    const active = book.activePolicy()!.rule;
    const r = sweep(book, { ...active, countries: ["KP", "IR"], isBlackList: true });
    const expected = book
      .list()
      .filter((h) => ["KP", "IR"].includes(h.country) && h.status === 1 && h.tier >= active.minTier && h.expiry > r.at).length;
    expect(r.aggregates.newlyIneligible).toBe(expected);
    expect(r.aggregates.newlyIneligible).toBeGreaterThan(0);
    for (const h of r.holders.filter((x) => x.becameIneligible)) {
      expect(h.after).toBe(Reason.IneligibleCountry);
      expect(["KP", "IR"]).toContain(h.country);
    }
  });

  it("tier raise to 60 strands the low-tier majority and totals their stranded value", () => {
    const r = sweep(book, { ...book.activePolicy()!.rule, minTier: 60 });
    const strandedManual = r.holders
      .filter((h) => h.becameIneligible)
      .reduce((a, h) => a + BigInt(h.position), 0n)
      .toString();
    expect(r.aggregates.strandedValue).toBe(strandedManual);
    expect(r.aggregates.newlyIneligible).toBeGreaterThan(5);
  });

  it("flags pending distribution legs that would suspend under the draft", () => {
    const r = sweep(book, { ...book.activePolicy()!.rule, minTier: 60 });
    expect(r.aggregates.strandedPendingLegs).toBeGreaterThan(0);
    expect(BigInt(r.aggregates.strandedPendingValue)).toBeGreaterThan(0n);
  });

  it("allow-list mode: only listed countries stay eligible", () => {
    const r = sweep(book, { ...book.activePolicy()!.rule, countries: ["SG"], isBlackList: false });
    for (const h of r.holders) {
      if (h.after === Reason.None) expect(h.country).toBe("SG");
    }
  });

  it("content-addresses the exact sweep independent of object key order", () => {
    const result = sweep(book, { ...book.activePolicy()!.rule, minTier: 60 }, 1_800_000_000);
    const reordered = {
      ...result,
      aggregates: {
        ...result.aggregates,
        reasonsAfter: Object.fromEntries(Object.entries(result.aggregates.reasonsAfter).reverse()),
      },
    };
    expect(hashSweepProof(reordered)).toBe(hashSweepProof(result));
    expect(hashSweepProof({ ...result, at: result.at + 1 })).not.toBe(hashSweepProof(result));
  });
});
