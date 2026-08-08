import { readFileSync, existsSync } from "node:fs";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { z } from "zod";
import { CooperateClient, fromEnv, VerifyCode } from "@meridian/cleanverse";
import { BookStore } from "./book/store.js";
import { seedBook } from "./book/seed.js";
import { hashSweepProof, sweep } from "./sim/sweep.js";
import { Reason, REASON_LABEL, evaluate, type SimRule } from "@meridian/sim";
import { buildEvidence, recordEnactmentSweep } from "./evidence.js";
import { Keeper, type Deployments } from "./chain/keeper.js";
import { demoKey, demoWallet } from "./chain/wallets.js";

const PORT = Number(process.env.PORT ?? 8787);
const { skills, cooperate } = fromEnv();
const book = new BookStore();

// ---- chain wiring (optional — the console degrades honestly without it) ------
let keeper: Keeper | undefined;
const depPath = new URL(`../../contracts/deployments/${process.env.MONAD_CHAIN_ID ?? "10143"}.json`, import.meta.url);
if (process.env.DEPLOYER_KEY && existsSync(depPath)) {
  const deployments = JSON.parse(readFileSync(depPath, "utf8")) as Deployments;
  keeper = new Keeper({
    rpc: process.env.MONAD_RPC ?? "https://testnet-rpc.monad.xyz",
    chainId: deployments.chainId,
    deployerKey: process.env.DEPLOYER_KEY as `0x${string}`,
    deployments,
  });
}

const app = Fastify({ logger: false });
await app.register(cors, { origin: true });

const ruleSchema = z.object({
  group: z.string().max(2).default(""),
  subGroup: z.string().max(2).default(""),
  minTier: z.number().int().min(0).max(99).default(0),
  minSubTier: z.number().int().min(0).max(99).default(0),
  countries: z.array(z.string().length(2)).max(32).default([]),
  isBlackList: z.boolean().default(true),
  active: z.boolean().default(true),
});

function draftFrom(body: unknown): SimRule {
  const active = book.activePolicy()?.rule;
  const partial = z
    .object({
      group: z.string().max(2).optional(),
      subGroup: z.string().max(2).optional(),
      minTier: z.number().int().min(0).max(99).optional(),
      minSubTier: z.number().int().min(0).max(99).optional(),
      countries: z.array(z.string().length(2)).max(32).optional(),
      isBlackList: z.boolean().optional(),
    })
    .parse(body ?? {});
  return ruleSchema.parse({ ...active, ...partial });
}

const serialize = (v: unknown): unknown => JSON.parse(JSON.stringify(v, (_, x) => (typeof x === "bigint" ? x.toString() : x)));

// ---- status -------------------------------------------------------------------
app.get("/api/status", async () => ({
  product: "meridian",
  cleanverse: {
    cooperate: cooperate.live ? "live" : "fixture",
    skills: "live",
  },
  chain: keeper
    ? { mode: "live", chainId: keeper.cfg.chainId, deployments: keeper.cfg.deployments, keeper: keeper.account.address }
    : { mode: "off" },
  book: { holders: book.holders.size, policies: book.policies.length, distributions: book.distributions.length },
}));

// ---- book ----------------------------------------------------------------------
app.get("/api/book", async () => {
  const now = Math.floor(Date.now() / 1000);
  const active = book.activePolicy();
  const rule = active?.rule;
  return serialize({
    assetId: book.assetId,
    policy: active,
    holders: book.list().map((h) => ({
      ...h,
      position: h.position.toString(),
      verdict: rule ? evaluate(h, rule, now) : Reason.None,
      verdictLabel: rule ? REASON_LABEL[evaluate(h, rule, now)] : "Eligible",
    })),
    distributions: book.distributions,
    policies: book.policies,
  });
});

app.get("/api/events", async () => serialize(book.events.slice(-200).reverse()));

// ---- sweep (simulate) ------------------------------------------------------------
app.post("/api/sweep", async (req) => {
  const draft = draftFrom(req.body);
  const result = sweep(book, draft);
  book.log("sweep", { draft: draft as unknown as Record<string, unknown>, newlyIneligible: result.aggregates.newlyIneligible });
  return serialize(result);
});

// ---- enact ------------------------------------------------------------------------
app.post("/api/enact", async (req, reply) => {
  const body = z.object({ memo: z.string().min(1).max(200) }).passthrough().parse(req.body ?? {});
  const draft = draftFrom(req.body);
  const result = sweep(book, draft);
  const proofHash = hashSweepProof(result);
  const version = (book.activePolicy()?.version ?? 0) + 1;

  // 1) Cleanverse write — the real rule surface. Shared-tenant safety: the sandbox
  // aUSDC is shared by all teams, so we only write rules to an A-Token we own
  // (MERIDIAN_ATOKEN); otherwise the write is an honestly-labeled fixture.
  const ownAtoken = process.env.MERIDIAN_ATOKEN;
  let cv;
  if (ownAtoken) {
    cv = await cooperate.atokenAddRule({ chain: "monad", atoken: ownAtoken, rule: draft });
  } else {
    cooperate.fixtures.addRule("meridian-demo-asset", draft);
    cv = { code: "0000", message: "success", data: { txHash: `0xfixture_rule_${Date.now()}` }, source: "fixture" as const };
  }
  if (cv.code !== "0000") {
    reply.code(502);
    return { error: `cleanverse rule write failed: ${cv.message}`, source: cv.source };
  }

  // 2) On-chain anchor (when chain is wired).
  let anchor: { proofTxHash?: string; enactTxHash?: string; versionHash?: string; parentHash?: string } = {};
  if (keeper) {
    const res = await keeper.enactPolicy(book.assetId, draft, `v${version}: ${body.memo}`, {
      hash: proofHash,
      affectedHolderCount: result.aggregates.newlyIneligible + result.aggregates.newlyEligible,
      strandedValue: BigInt(result.aggregates.strandedValue),
    });
    anchor = res;
  }

  const policyVersion = {
    version,
    rule: draft,
    memo: body.memo,
    enactedAt: Math.floor(Date.now() / 1000),
    proofHash,
    ...(anchor.versionHash !== undefined ? { versionHash: anchor.versionHash } : {}),
    ...(anchor.parentHash !== undefined ? { parentHash: anchor.parentHash } : {}),
    ...(anchor.proofTxHash !== undefined ? { proofTx: anchor.proofTxHash } : {}),
    ...(anchor.enactTxHash !== undefined ? { enactTx: anchor.enactTxHash } : {}),
    cleanverse: { source: cv.source, ...(cv.data?.txHash !== undefined ? { txHash: cv.data.txHash } : {}) },
  };
  book.policies.push(policyVersion);
  recordEnactmentSweep(version, result);
  book.log("enact", {
    version,
    memo: body.memo,
    proofHash,
    cleanverse: cv.source,
    proofTx: anchor.proofTxHash ?? "none",
    enactTx: anchor.enactTxHash ?? "none",
  });

  return serialize({ enacted: policyVersion, sweep: result });
});

// ---- holder actions -----------------------------------------------------------------
app.post("/api/holders/:wallet/freeze", async (req, reply) => {
  const { wallet } = req.params as { wallet: string };
  const body = z.object({ reason: z.string().max(200).default("manual freeze") }).parse(req.body ?? {});
  const h = book.holder(wallet);
  if (!h) {
    reply.code(404);
    return { error: "unknown holder" };
  }
  const cv = await cooperate.updateStatus({ wallet: { chain: "monad", address: wallet }, status: 2, blacklistReason: body.reason });
  let chainTx: string | undefined;
  if (keeper) chainTx = await keeper.setStatus(wallet, 2);
  h.status = 2;
  book.upsertHolder(h);
  book.log("freeze", { wallet, reason: body.reason, cleanverse: cv.source, chainTx: chainTx ?? "none" });
  return serialize({ ok: true, cleanverse: cv, chainTx });
});

app.post("/api/holders/:wallet/reactivate", async (req, reply) => {
  const { wallet } = req.params as { wallet: string };
  const h = book.holder(wallet);
  if (!h) {
    reply.code(404);
    return { error: "unknown holder" };
  }
  const cv = await cooperate.updateStatus({ wallet: { chain: "monad", address: wallet }, status: 1 });
  let chainTx: string | undefined;
  if (keeper) chainTx = await keeper.setStatus(wallet, 1);
  h.status = 1;
  book.upsertHolder(h);
  book.log("reactivate", { wallet, cleanverse: cv.source, chainTx: chainTx ?? "none" });
  return serialize({ ok: true, cleanverse: cv, chainTx });
});

/** Remediation: fetch the live Cleanverse magiclink for a stranded holder. */
app.get("/api/holders/:wallet/remediation", async () => {
  const ml = await skills.getMagiclink();
  return serialize({ magiclink: ml.data?.register_url, source: ml.source });
});

// ---- the Act-2 on-chain proof beat ---------------------------------------------------
app.post("/api/prove-transfer", async (req, reply) => {
  const body = z.object({ fromIndex: z.number().int().min(0), toIndex: z.number().int().min(0), amount: z.string().default("1000000") }).parse(req.body ?? {});
  if (!keeper) {
    // Honest degradation: report the sim verdict, labeled as such.
    const from = book.holder(demoWallet(body.fromIndex));
    const to = book.holder(demoWallet(body.toIndex));
    const rule = book.activePolicy()?.rule;
    if (!from || !to || !rule) {
      reply.code(400);
      return { error: "book/policy not ready" };
    }
    const now = Math.floor(Date.now() / 1000);
    const fromR = evaluate(from, rule, now);
    const toR = evaluate(to, rule, now);
    const blocked = fromR !== Reason.None ? fromR : toR;
    return serialize({
      source: "fixture",
      ok: blocked === Reason.None,
      reason: blocked,
      reasonLabel: REASON_LABEL[blocked],
      note: "chain off — simulated verdict from the same rule engine (see differential parity suite)",
    });
  }
  const to = demoWallet(body.toIndex);
  const res = await keeper.proveTransfer(demoKey(body.fromIndex), to, BigInt(body.amount));
  book.log("proof:transfer", { from: demoWallet(body.fromIndex), to, ...res });
  return serialize({
    source: "live",
    ...res,
    reasonLabel: res.reason !== undefined ? REASON_LABEL[res.reason as Reason] : undefined,
  });
});

// ---- distributions ---------------------------------------------------------------------
app.post("/api/distributions/:id/pay", async (req, reply) => {
  const id = Number((req.params as { id: string }).id);
  const run = book.distributions.find((d) => d.id === id);
  if (!run) {
    reply.code(404);
    return { error: "unknown run" };
  }
  const rule = book.activePolicy()?.rule;
  if (!rule) {
    reply.code(400);
    return { error: "no active policy" };
  }
  const now = Math.floor(Date.now() / 1000);

  let source: "live" | "fixture" = "fixture";
  let payTx: string | undefined;
  if (keeper && run.onchainRunId === undefined) {
    const { runId } = await keeper.createDistributionRun(
      book.assetId,
      run.legs.map((l) => l.wallet),
      run.legs.map((l) => l.amount),
      run.memo,
    );
    run.onchainRunId = Number(runId);
  }
  if (keeper && run.onchainRunId !== undefined) {
    try {
      payTx = await keeper.payLegs(BigInt(run.onchainRunId), 0, run.legs.length);
      source = "live";
      // Read authoritative leg states back from the chain.
      for (let i = 0; i < run.legs.length; i++) {
        const leg = await keeper.legAt(BigInt(run.onchainRunId), i);
        const l = run.legs[i]!;
        l.state = (["pending", "paid", "suspended", "released"] as const)[leg.state]!;
        l.reason = leg.reason;
        if (l.state === "paid") l.txHash = payTx;
      }
    } catch (err) {
      // Repeat runs hit "nothing to pay" once every leg already resolved on-chain;
      // re-read the authoritative states and report idempotently instead of 500ing.
      for (let i = 0; i < run.legs.length; i++) {
        try {
          const leg = await keeper.legAt(BigInt(run.onchainRunId), i);
          const l = run.legs[i]!;
          l.state = (["pending", "paid", "suspended", "released"] as const)[leg.state]!;
          l.reason = leg.reason;
        } catch {
          /* leg read failed — keep last known state */
        }
      }
      book.log("distribution:pay", { runId: id, source: "live", idempotent: true, cause: String(err).slice(0, 120) });
      return serialize({ run, source: "live", idempotent: true });
    }
  } else {
    for (const l of run.legs) {
      if (l.state !== "pending") continue;
      const h = book.holder(l.wallet);
      const verdict = h ? evaluate(h, rule, now) : Reason.NotRegistered;
      l.state = verdict === Reason.None ? "paid" : "suspended";
      l.reason = verdict;
    }
  }

  // Travel Rule evidence per paid leg (live download when sandbox allows).
  for (const l of run.legs) {
    if (l.state === "paid" && l.txHash && !l.travelRule) {
      const tr = await cooperate.downloadTravelRule({ txHash: l.txHash, wallet: { chain: "monad", address: l.wallet } });
      l.travelRule = { source: tr.source, ...(tr.data?.url !== undefined ? { url: tr.data.url } : {}) };
    }
  }

  book.log("distribution:pay", { runId: id, source, payTx: payTx ?? "none" });
  return serialize({ run, source, payTx });
});

app.post("/api/distributions/:id/release/:leg", async (req, reply) => {
  const { id: idRaw, leg: legRaw } = req.params as { id: string; leg: string };
  const id = Number(idRaw);
  const legIndex = Number(legRaw);
  const run = book.distributions.find((d) => d.id === id);
  const leg = run?.legs[legIndex];
  if (!run || !leg) {
    reply.code(404);
    return { error: "unknown leg" };
  }
  const rule = book.activePolicy()?.rule;
  const h = book.holder(leg.wallet);
  if (!rule || !h) {
    reply.code(400);
    return { error: "book/policy not ready" };
  }

  if (keeper && run.onchainRunId !== undefined) {
    try {
      const tx = await keeper.releaseLeg(BigInt(run.onchainRunId), legIndex);
      leg.state = "released";
      leg.reason = Reason.None;
      leg.txHash = tx;
      book.log("distribution:release", { runId: id, legIndex, tx });
      return serialize({ ok: true, source: "live", tx, run });
    } catch {
      const verdict = evaluate(h, rule, Math.floor(Date.now() / 1000));
      reply.code(409);
      return serialize({ ok: false, source: "live", reason: verdict, reasonLabel: REASON_LABEL[verdict] });
    }
  }

  const verdict = evaluate(h, rule, Math.floor(Date.now() / 1000));
  if (verdict !== Reason.None) {
    reply.code(409);
    return serialize({ ok: false, source: "fixture", reason: verdict, reasonLabel: REASON_LABEL[verdict] });
  }
  leg.state = "released";
  leg.reason = Reason.None;
  book.log("distribution:release", { runId: id, legIndex, source: "fixture" });
  return serialize({ ok: true, source: "fixture", run });
});

// ---- reconciliation (the honesty proof) ---------------------------------------------------
app.post("/api/reconcile", async () => {
  const sample = book.list().slice(0, 8);
  const rows = [];
  // Reconcile sim↔chain on the *credential layer only*: the on-chain registry was
  // synced from the book at boot (a policy demo may have evolved it since), while
  // verify_apass reads the live sandbox credential store.
  for (const h of sample) {
    const cv = await cooperate.verifyApass({ chain: "monad", atoken: "0xaC0893567D43C3E7e6e35a72803df05416C1f20D", address: h.wallet });
    let chainCred: number | undefined;
    if (keeper) {
      // probe transfer eligibility where the credential layer dominates: holder→holder
      // under a null-then-current rule reads the same credential gate the registry enforces
      const { toReason } = await keeper.checkTransfer(demoWallet(0), h.wallet);
      chainCred = toReason;
    }
    const cvValid = cv.data.code === VerifyCode.Valid;
    // The live sandbox's credential answer (exists/active) must match the book row's
    // *credential* state (its status field), independent of the asset policy layer.
    const bookCredOk = h.status === 1;
    const credentialAgree = cvValid === bookCredOk;
    rows.push({
      wallet: h.wallet,
      name: h.name,
      bookCredential: bookCredOk ? "active" : "frozen",
      cleanverse: { code: cv.data.code, message: cv.data.message, source: cv.source },
      chain: chainCred,
      agree: credentialAgree,
    });
  }
  book.log("sync", { reconciled: rows.length });
  return serialize({
    rows,
    note: "credential layer: book status ↔ verify_apass; on-chain gate reads the keeper-synced registry (policy layer is proven by the 500-vector differential suite)",
  });
});

// ---- Meridian's own Agent Skill surface (read/simulate only, by design) --------------------
app.get("/api/skills/skill.md", async (_req, reply) => {
  reply.type("text/markdown");
  return readFileSync(new URL("../skill/SKILL.md", import.meta.url), "utf8");
});

app.post("/api/skills/query_book", async () => {
  const now = Math.floor(Date.now() / 1000);
  const rule = book.activePolicy()?.rule;
  const holders = book.list();
  const eligible = rule ? holders.filter((h) => evaluate(h, rule, now) === Reason.None).length : holders.length;
  const pending = book.distributions.flatMap((d) => d.legs).filter((l) => l.state === "pending");
  return serialize({
    code: "0000",
    message: "success",
    data: {
      assetId: book.assetId,
      holderCount: holders.length,
      eligible,
      ineligible: holders.length - eligible,
      activePolicy: book.activePolicy(),
      pendingDistributionLegs: pending.length,
      pendingDistributionValue: pending.reduce((a, l) => a + l.amount, 0n).toString(),
    },
  });
});

app.post("/api/skills/simulate_policy", async (req) => {
  const draft = draftFrom(req.body);
  const result = sweep(book, draft);
  book.log("sweep", { via: "skill", newlyIneligible: result.aggregates.newlyIneligible });
  return serialize({ code: "0000", message: "success", data: result });
});

app.post("/api/skills/verify_policy_proof", async () => {
  const policy = book.activePolicy();
  if (!policy?.proofHash) {
    return {
      code: "0003",
      message: "active policy has no proof digest",
      data: { assetId: book.assetId, verified: false, source: "unavailable" },
    };
  }
  const identity = { assetId: book.assetId, policyVersion: policy.version, proofHash: policy.proofHash };
  if (!keeper) {
    return {
      code: "0000",
      message: "proof digest available; chain verification unavailable in fixture mode",
      data: { ...identity, verified: false, source: "fixture" },
    };
  }
  try {
    const proof = await keeper.activePolicyProof(book.assetId);
    const zeroHash = `0x${"0".repeat(64)}`;
    const verified =
      proof.proofHash.toLowerCase() === policy.proofHash.toLowerCase() &&
      proof.versionHash !== zeroHash &&
      proof.consumed &&
      proof.anchoredAt > 0n &&
      proof.anchoredAt <= proof.enactedAt;
    return serialize({
      code: "0000",
      message: verified ? "active policy proof verified" : "active policy proof failed verification",
      data: {
        ...identity,
        verified,
        source: "chain",
        chainId: keeper.cfg.chainId,
        registry: keeper.cfg.deployments.policy,
        record: proof,
      },
    });
  } catch {
    return {
      code: "0000",
      message: "active policy proof unavailable on configured registry",
      data: {
        ...identity,
        verified: false,
        source: "chain",
        chainId: keeper.cfg.chainId,
        registry: keeper.cfg.deployments.policy,
      },
    };
  }
});

app.post("/api/skills/get_evidence", async (req, reply) => {
  const body = z.object({ version: z.number().int().min(1) }).parse(req.body ?? {});
  const pack = buildEvidence(book, body.version);
  if (!pack) {
    reply.code(404);
    return { code: "0002", message: "unknown policy version", data: null };
  }
  return serialize({ code: "0000", message: "success", data: pack });
});

// ---- evidence ---------------------------------------------------------------------------------
app.get("/api/evidence/:version", async (req, reply) => {
  const version = Number((req.params as { version: string }).version);
  const pack = buildEvidence(book, version);
  if (!pack) {
    reply.code(404);
    return { error: "unknown policy version" };
  }
  return serialize(pack);
});

// ---- boot -------------------------------------------------------------------------------------
/** Seed the book and sync the chain — everything except listening. */
export async function prepare(): Promise<void> {
  // Live mode: seed bulk book via a local fixture client — the sandbox tenant is
  // shared by every team, so we never mass-write there (real rows are overlaid below).
  // Fixture mode: seed through the main client so its store knows every holder.
  const seeder = cooperate.live ? new CooperateClient({ base: "local://seed", allowFixtures: true }) : cooperate;
  await seedBook(book, seeder);

  // Overlay REAL sandbox credential state for the first 12 holders (created once
  // via scripts/sync-live-holders.ts). Rows found live get live provenance.
  if (cooperate.live) {
    let liveRows = 0;
    const wallets = book.list().slice(0, 12);
    for (const h of wallets) {
      const rec = await cooperate.queryApass({ chain: "monad", address: h.wallet });
      if (rec.code === "0000" && rec.data?.cvRecordId) {
        h.cvRecordId = rec.data.cvRecordId;
        h.tier = Number(rec.data.tier) || h.tier;
        h.subTier = rec.data.subTier ?? h.subTier;
        h.country = rec.data.countries?.[0] ?? h.country;
        h.status = (rec.data.status ?? rec.data.state ?? 1) as number;
        h.expiry = rec.data.expirationTime ?? h.expiry;
        h.source = "live";
        book.upsertHolder(h);
        liveRows++;
      }
    }
    book.log("sync", { liveOverlay: liveRows, tenant: "shared-sandbox" });  }
  if (keeper) {
    const holders = book.list();
    const bal = await keeper.pub.getBalance({ address: keeper.account.address });
    if (bal < 5n * 10n ** 16n) {
      // Deployer below ~0.05 MON: chain stays live for READS (checkTransfer, registry
      // reads, evidence anchors) but writes are skipped honestly — noted in status.
      book.log("sync", { chainWritesSkipped: true, reason: "insufficient deployer gas", balanceWei: bal.toString() });
    } else {
      const tx = await keeper.attestBook(holders);
      const minted = await keeper.mintNotes(holders.map((h) => ({ wallet: h.wallet, amount: h.position })));
      book.log("sync", { attested: holders.length, minted, tx: tx ?? "already-synced" });
    }
  }
}

export async function boot(): Promise<void> {
  await prepare();
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`meridian server :${PORT} — cooperate=${cooperate.live ? "LIVE" : "FIXTURE"} chain=${keeper ? "LIVE" : "OFF"} holders=${book.holders.size}`);
}

export { app, book, keeper, cooperate, skills };

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop() ?? "")) {
  boot().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
