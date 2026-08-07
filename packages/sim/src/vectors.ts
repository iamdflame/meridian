/**
 * Deterministic differential test vectors for RuleV2 semantics.
 * Generated with a seeded PRNG; consumed by BOTH:
 *   - server/test/rulev2.test.ts       (TypeScript implementation)
 *   - contracts/test/RuleVectors.t.sol (Solidity implementation, via vm.readFile)
 * If either implementation drifts, its suite fails against the shared expectations.
 */
import { evaluate, type Reason, type SimHolder, type SimRule } from "./rulev2.js";

// xorshift32 — tiny deterministic PRNG (not crypto; test-vector generation only).
function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 0xffffffff;
  };
}

const COUNTRIES = ["SG", "US", "GB", "KP", "IR", "DE", "JP", "NG", "BR", "IN"];
const GROUPS = ["", "AB", "CD"];
const NOW = 1_754_600_000; // fixed evaluation timestamp

export interface Vector {
  holder: SimHolder;
  rule: SimRule;
  now: number;
  expected: Reason;
}

export function generateVectors(count = 500, seed = 0xc1ea): Vector[] {
  const r = rng(seed);
  const pick = <T>(xs: T[]): T => xs[Math.floor(r() * xs.length)]!;
  const vectors: Vector[] = [];
  for (let i = 0; i < count; i++) {
    const holder: SimHolder = {
      cvRecordId: `cv-${i}`,
      tier: Math.floor(r() * 100),
      subTier: Math.floor(r() * 100),
      group: pick(GROUPS.slice(1)),
      subGroup: pick(GROUPS.slice(1)),
      country: pick(COUNTRIES),
      status: r() < 0.15 ? 2 : 1,
      expiry: NOW + Math.floor((r() - 0.3) * 1_000_000),
      exists: r() >= 0.1,
    };
    const nCountries = Math.floor(r() * 4);
    const countries: string[] = [];
    for (let c = 0; c < nCountries; c++) {
      const cc = pick(COUNTRIES);
      if (!countries.includes(cc)) countries.push(cc);
    }
    const rule: SimRule = {
      group: pick(GROUPS),
      subGroup: pick(GROUPS),
      minTier: Math.floor(r() * 100),
      minSubTier: Math.floor(r() * 50),
      countries,
      isBlackList: r() < 0.5,
      active: r() >= 0.05,
    };
    vectors.push({ holder, rule, now: NOW, expected: evaluate(holder, rule, NOW) });
  }
  return vectors;
}
