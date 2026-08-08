/**
 * M5 headless e2e — the full demo path, zero manual steps:
 *   status → book → draft sweep → ENACT → transfer-flip proof → coupon run
 *   → suspend → remediate → release → evidence pack → agent skill surface.
 * Runs in fixture mode without chain, or full-live with DEPLOYER_KEY + deployments.
 *   node --import tsx server/scripts/e2e-demo-path.ts
 */
import type { InjectOptions } from "fastify";
import { app, prepare, book } from "../src/index.js";

let failures = 0;
function check(label: string, cond: boolean, detail?: unknown): void {
  const mark = cond ? "✓" : "✗";
  console.log(`${mark} ${label}${detail !== undefined ? ` — ${JSON.stringify(detail).slice(0, 140)}` : ""}`);
  if (!cond) failures++;
}

async function call<T = Record<string, unknown>>(method: "GET" | "POST", url: string, payload?: unknown): Promise<{ status: number; body: T }> {
  const opts: InjectOptions = { method, url };
  if (payload !== undefined) opts.payload = payload as Record<string, unknown>;
  const res = await app.inject(opts);
  return { status: res.statusCode, body: res.json() as T };
}

await prepare();

// Act 0 — status
const status = await call("GET", "/api/status");
check("status 200", status.status === 200, status.body);

// Act 1 — the living book
const bookRes = await call<{ holders: Array<{ wallet: string; verdict: number; country: string; name: string }>; policy: { version: number } }>("GET", "/api/book");
check("book has 48 holders", bookRes.body.holders.length === 48);
check("baseline policy v1 active", bookRes.body.policy.version === 1);
const eligibleBefore = bookRes.body.holders.filter((h) => h.verdict === 0).length;
check("majority eligible under v1", eligibleBefore > 30, { eligibleBefore });

// Act 2 — draft sweep: blacklist KP/IR + minTier 30
const draft = { countries: ["KP", "IR"], isBlackList: true, minTier: 30, memo: "v2: sanctions update — blacklist KP/IR, raise floor to tier 30" };
const sweepRes = await call<{ aggregates: Record<string, number & string> }>("POST", "/api/sweep", draft);
check("sweep reports blast radius", Number(sweepRes.body.aggregates.newlyIneligible) > 0, sweepRes.body.aggregates);

// Pick a holder who will be stranded (for the transfer-flip proof)
const strandedIdx = bookRes.body.holders.findIndex((h) => ["KP", "IR"].includes(h.country) && h.verdict === 0);
const okIdx = bookRes.body.holders.findIndex((h) => h.country === "SG" && h.verdict === 0);
check("found stranded + eligible demo holders", strandedIdx >= 0 && okIdx >= 0, { strandedIdx, okIdx });

// Transfer passes BEFORE enactment — skip only if this asset was already enacted
// in an earlier run (on-chain state persists between boots).
const alreadyV2 = book.policies.length > 1;
if (alreadyV2) console.log("ℹ v2 already active on-chain (repeat run) — skipping pre-enact transfer beat");
if (!alreadyV2) {
  const before = await call<{ ok: boolean; source: string }>("POST", "/api/prove-transfer", { fromIndex: okIdx, toIndex: strandedIdx });
  check("transfer to KP/IR holder passes under v1", before.body.ok === true, before.body);
}

// ENACT
const enact = await call<{
  enacted: { version: number; proofHash: string; cleanverse: { source: string } };
  sweep: { aggregates: Record<string, unknown> };
}>("POST", "/api/enact", draft);
check("enact v2 succeeds", enact.status === 200 && enact.body.enacted.version === 2, enact.body.enacted);
check("enact publishes the sweep proof digest", /^0x[0-9a-f]{64}$/.test(enact.body.enacted.proofHash), enact.body.enacted.proofHash);

// The SAME transfer now refuses, with a legible reason
const after = await call<{ ok: boolean; reasonLabel?: string }>("POST", "/api/prove-transfer", { fromIndex: okIdx, toIndex: strandedIdx });
check("same transfer now blocked with reason", after.body.ok === false && Boolean(after.body.reasonLabel), after.body);

// Act 2b — coupon run: eligible legs pay, stranded legs suspend
const pay = await call<{ run: { legs: Array<{ state: string; reason: number; wallet: string }> } }>("POST", "/api/distributions/1/pay");
const paid = pay.body.run.legs.filter((l) => l.state === "paid").length;
const suspended = pay.body.run.legs.filter((l) => l.state === "suspended");
check("coupon run pays eligible legs", paid > 0, { paid });
check("stranded legs suspended (caught, not lost)", suspended.length > 0, { suspended: suspended.length });

// Release refused while still ineligible
const legIndex = pay.body.run.legs.findIndex((l) => l.state === "suspended");
const failRelease = await call("POST", `/api/distributions/1/release/${legIndex}`);
check("release refused while ineligible (409)", failRelease.status === 409, failRelease.body);

// Remediation: magiclink (live Skills API) + reactivation via tier-eligible re-attestation
const suspendedWallet = pay.body.run.legs[legIndex]!.wallet;
const remediation = await call<{ magiclink?: string; source: string }>("GET", `/api/holders/${suspendedWallet}/remediation`);
check("remediation magiclink issued (live skills API)", Boolean(remediation.body.magiclink), remediation.body);

// Simulate the holder re-verifying in an eligible jurisdiction: update book + chain state
const holder = book.holder(suspendedWallet)!;
holder.country = "SG";
holder.tier = Math.max(holder.tier, 30);
book.upsertHolder(holder);
const { keeper } = await import("../src/index.js");
if (keeper) await keeper.attestBook([holder]);

const release = await call<{ ok: boolean }>("POST", `/api/distributions/1/release/${legIndex}`);
check("release succeeds after remediation", release.body.ok === true, release.body);

// Act 3 — evidence pack
const evidence = await call<{
  policy: { version: number; onchainAnchor: Record<string, string> };
  holdersAffected: unknown[];
  verification: { how: string[] };
}>("GET", "/api/evidence/2");
check("evidence pack exists for v2", evidence.status === 200 && evidence.body.policy.version === 2);
check("evidence carries the enacted proof digest", evidence.body.policy.onchainAnchor.proofHash === enact.body.enacted.proofHash);
check("evidence lists affected holders", evidence.body.holdersAffected.length > 0, { affected: evidence.body.holdersAffected.length });
check("evidence carries verification instructions", evidence.body.verification.how.length >= 3);

// Agent Skill surface (Meridian's own ASF integration)
const skillMd = await app.inject({ method: "GET", url: "/api/skills/skill.md" });
check("SKILL.md served", skillMd.statusCode === 200 && skillMd.body.includes("simulate_policy"));
const agentSweep = await call<{ code: string; data: { aggregates: Record<string, unknown> } }>("POST", "/api/skills/simulate_policy", { minTier: 60 });
check("agent can simulate (never enact)", agentSweep.body.code === "0000", agentSweep.body.data.aggregates);
const agentBook = await call<{ code: string; data: { holderCount: number } }>("POST", "/api/skills/query_book");
check("agent can query book", agentBook.body.code === "0000" && agentBook.body.data.holderCount === 48);

// Reconciliation — sim vs cleanverse vs chain agree
const rec = await call<{ rows: Array<{ agree: boolean }> }>("POST", "/api/reconcile");
check("reconciliation: all sampled verdicts agree", rec.body.rows.every((r) => r.agree), { sampled: rec.body.rows.length });

console.log(failures === 0 ? "\nE2E DEMO PATH: ALL GREEN" : `\nE2E DEMO PATH: ${failures} FAILURE(S)`);
await app.close();
process.exit(failures === 0 ? 0 : 1);
