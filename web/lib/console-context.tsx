"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  type BookState,
  type SimRule,
  type SweepOutcome,
  type Run,
  demoEngine,
  detectServer,
  serverApi,
} from "./engine";

interface ConsoleApi {
  book: BookState | undefined;
  refresh: () => Promise<void>;
  sweep: (draft: SimRule) => Promise<SweepOutcome>;
  enact: (draft: SimRule, memo: string) => Promise<void>;
  freeze: (wallet: string, reason: string) => Promise<void>;
  reactivate: (wallet: string) => Promise<void>;
  remediate: (wallet: string) => Promise<{ magiclink?: string }>;
  proveTransfer: (fromIndex: number, toIndex: number) => Promise<{ ok: boolean; txHash?: string; reasonLabel?: string; source: string }>;
  payRun: (id: number) => Promise<Run | undefined>;
  releaseLeg: (id: number, leg: number) => Promise<{ ok: boolean; reasonLabel?: string }>;
  evidence: (version: number) => Promise<Record<string, unknown> | undefined>;
}

const Ctx = createContext<ConsoleApi | undefined>(undefined);

export function ConsoleProvider({ children }: { children: React.ReactNode }) {
  const [book, setBook] = useState<BookState | undefined>();
  const serverRef = useRef<boolean | undefined>(undefined);

  const load = useCallback(async () => {
    if (serverRef.current === undefined) serverRef.current = await detectServer();
    if (serverRef.current) {
      try {
        setBook(await serverApi.book());
        return;
      } catch {
        serverRef.current = false;
      }
    }
    const d = demoEngine();
    setBook({ ...d.state() });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const api = useMemo<ConsoleApi>(
    () => ({
      book,
      refresh: load,
      async sweep(draft) {
        if (serverRef.current) return serverApi.sweep(draft);
        return demoEngine().sweep(draft);
      },
      async enact(draft, memo) {
        if (serverRef.current) await serverApi.enact(draft, memo);
        else demoEngine().enact(draft, memo);
        await load();
      },
      async freeze(wallet, reason) {
        if (serverRef.current) await serverApi.freeze(wallet, reason);
        else demoEngine().setStatus(wallet, 2, reason);
        await load();
      },
      async reactivate(wallet) {
        if (serverRef.current) await serverApi.reactivate(wallet);
        else demoEngine().setStatus(wallet, 1);
        await load();
      },
      async remediate(wallet) {
        if (serverRef.current) {
          const r = await serverApi.remediation(wallet);
          return { ...(r.magiclink !== undefined ? { magiclink: r.magiclink } : {}) };
        }
        demoEngine().remediate(wallet);
        await load();
        return { magiclink: "https://test-magiclink.cleanverse.com/" };
      },
      async proveTransfer(fromIndex, toIndex) {
        if (serverRef.current) return serverApi.proveTransfer(fromIndex, toIndex);
        // demo: verdict from the same engine
        const d = demoEngine();
        const from = d.holders[fromIndex];
        const to = d.holders[toIndex];
        const rule = d.activeRule();
        const { evaluate, Reason, REASON_LABEL } = await import("@meridian/sim");
        const t = Math.floor(Date.now() / 1000);
        const fr = from ? evaluate(from, rule, t) : Reason.NotRegistered;
        const tr = to ? evaluate(to, rule, t) : Reason.NotRegistered;
        const blocked = fr !== Reason.None ? fr : tr;
        return { ok: blocked === Reason.None, reasonLabel: REASON_LABEL[blocked], source: "demo" };
      },
      async payRun(id) {
        if (serverRef.current) {
          const r = await serverApi.payRun(id);
          await load();
          return r.run;
        }
        const run = demoEngine().payRun(id);
        await load();
        return run;
      },
      async releaseLeg(id, leg) {
        if (serverRef.current) {
          const r = await serverApi.releaseLeg(id, leg);
          await load();
          return { ok: r.ok, ...(r.reasonLabel !== undefined ? { reasonLabel: r.reasonLabel } : {}) };
        }
        const { REASON_LABEL } = await import("@meridian/sim");
        const r = demoEngine().releaseLeg(id, leg);
        await load();
        return { ok: r.ok, ...(r.reason !== undefined ? { reasonLabel: REASON_LABEL[r.reason] } : {}) };
      },
      async evidence(version) {
        if (serverRef.current) return serverApi.evidence(version);
        const d = demoEngine();
        const p = d.policies.find((x) => x.version === version);
        if (!p) return undefined;
        return {
          product: "meridian",
          assetId: d.assetId,
          generatedAt: Date.now(),
          policy: { version: p.version, memo: p.memo, rule: p.rule, enactedAt: p.enactedAt, cleanverseWrite: p.cleanverse, onchainAnchor: {} },
          holdersAffected: [],
          distributions: d.distributions.map((run) => ({ runId: run.id, memo: run.memo, legs: run.legs })),
          auditTrail: d.events,
          verification: {
            note: "Demo mode — deploy the full stack for on-chain anchors.",
            how: [
              "PolicyRegistry.versionAt(assetId, n) verifies the hash chain on the live deployment.",
              "VerifiedAssetToken.checkTransfer(from, to) reproduces any verdict from public state.",
              "DistributionEngine.legAt(runId, i) returns each leg's state and reason on-chain.",
            ],
          },
        };
      },
    }),
    [book, load],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useConsole(): ConsoleApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useConsole outside ConsoleProvider");
  return ctx;
}
