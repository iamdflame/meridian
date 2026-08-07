import type { CooperateClient } from "@meridian/cleanverse";
import { demoWallet } from "../chain/wallets.js";
import type { HolderRow } from "./store.js";
import type { BookStore } from "./store.js";

/**
 * Seeds a realistic issuer book: ~48 verified identities generated through the
 * Cleanverse Cooperate API (live when credentials exist, honest fixtures otherwise),
 * positions in the demo RWA note, and one pending coupon run.
 * Deterministic — the demo book is identical on every boot.
 */

const FIRST = ["Amara", "Wei", "Sofia", "Ravi", "Elena", "Kenji", "Fatima", "Lucas", "Ingrid", "Tunde", "Mei", "Diego", "Anya", "Omar", "Grace", "Hiro"];
const LAST = ["Okafor", "Chen", "Alvarez", "Iyer", "Petrova", "Tanaka", "Hassan", "Silva", "Larsen", "Adeyemi", "Wong", "Souza", "Volkova", "Farouk", "Njoku", "Sato"];
// Country distribution: mostly friendly jurisdictions + a deliberate cluster in KP/IR
// so a sanctions-list draft has a visible blast radius, + US cluster for Reg S drama.
const COUNTRIES = ["SG", "SG", "SG", "US", "US", "GB", "DE", "JP", "NG", "BR", "IN", "KP", "IR", "GB", "JP", "SG"];

function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SeedOptions {
  count?: number;
  chain?: string;
}

export async function seedBook(book: BookStore, cooperate: CooperateClient, opts: SeedOptions = {}): Promise<void> {
  const count = opts.count ?? 48;
  const chain = opts.chain ?? "monad";
  const rand = mulberry(0xc1ea);
  const now = Math.floor(Date.now() / 1000);

  for (let i = 0; i < count; i++) {
    const name = `${FIRST[i % FIRST.length]} ${LAST[(i * 7 + 3) % LAST.length]}`;
    const country = COUNTRIES[(i * 5 + 1) % COUNTRIES.length]!;
    const tier = 5 + Math.floor(rand() * 75);
    const subTier = Math.min(99, Math.max(1, Math.floor(tier / 2)));
    const wallet = demoWallet(i);
    const customerId = `MERIDIAN${String(i).padStart(6, "0")}`;
    // A handful of soon-expiring credentials make expiry a live dimension in the demo.
    const expiry = i % 11 === 0 ? now + 3600 : now + 60 * 60 * 24 * (30 + Math.floor(rand() * 300));

    const res = await cooperate.generateApass({
      customerId,
      subTier,
      subGroup: "MD",
      expirationTime: expiry,
      wallet: { address: wallet, chain },
      identityDataList: [{ idType: "PASSPORT", fullName: name, issuingCountryISO2: country }],
    });

    const rec = res.data;
    const row: HolderRow = {
      wallet,
      name,
      customerId,
      cvRecordId: rec?.cvRecordId ?? `local-${i}`,
      tier: rec ? Number(rec.tier) : tier,
      subTier: rec?.subTier ?? subTier,
      group: rec?.group ?? "MD",
      subGroup: rec?.subGroup ?? "MD",
      country,
      status: 1,
      expiry,
      exists: true,
      position: BigInt(Math.floor(10_000 + rand() * 490_000)) * 10n ** 6n / 10n, // 1k–49k face, 6dp
      source: res.source,
    };
    book.upsertHolder(row);
  }

  // Two pre-frozen credentials (compliance history exists on day one).
  const frozen = [3, 27];
  for (const i of frozen) {
    const w = demoWallet(i);
    await cooperate.updateStatus({ wallet: { chain, address: w }, status: 2, blacklistReason: "screening hit — seeded state" });
    const h = book.holder(w);
    if (h) {
      h.status = 2;
      book.upsertHolder(h);
    }
  }

  // Baseline policy v1 mirrors the on-chain deployment baseline.
  book.policies.push({
    version: 1,
    rule: { group: "", subGroup: "", minTier: 10, minSubTier: 0, countries: [], isBlackList: true, active: true },
    memo: "v1: baseline — minTier 10, no jurisdiction restriction",
    enactedAt: now,
    cleanverse: { source: book.list()[0]?.source ?? "fixture" },
  });

  // One pending coupon run across the top holders — the Act-2 escrow beat's subject.
  const top = book
    .list()
    .sort((a, b) => (b.position > a.position ? 1 : -1))
    .slice(0, 12);
  book.distributions.push({
    id: 1,
    memo: "Q3 coupon — 2.1% on face",
    createdAt: now,
    legs: top.map((h) => ({
      wallet: h.wallet,
      amount: (h.position * 21n) / 1000n,
      state: "pending" as const,
      reason: 0,
    })),
  });

  book.log("seed", { holders: count, frozen: frozen.length, distributions: 1, source: book.list()[0]?.source });
}
