"use client";

import { Reason, REASON_LABEL, evaluate, type SimHolder, type SimRule } from "@meridian/sim";
import demoBook from "./demo-book.json";

export { Reason, REASON_LABEL };
export type { SimRule };

export type Provenance = "live" | "fixture" | "demo";

export interface Holder extends SimHolder {
  wallet: string;
  name: string;
  customerId: string;
  position: string;
  source: Provenance;
  verdict: Reason;
}

export interface Policy {
  version: number;
  rule: SimRule;
  memo: string;
  enactedAt: number;
  versionHash?: string;
  parentHash?: string;
  anchorTx?: string;
  cleanverse: { source: Provenance; txHash?: string };
}

export interface Leg {
  wallet: string;
  amount: string;
  state: "pending" | "paid" | "suspended" | "released";
  reason: Reason;
  txHash?: string;
  travelRule?: { source: Provenance; url?: string };
}

export interface Run {
  id: number;
  memo: string;
  createdAt: number;
  legs: Leg[];
}

export interface HolderImpact {
  wallet: string;
  name: string;
  cvRecordId: string;
  tier: number;
  country: string;
  position: string;
  before: Reason;
  after: Reason;
  becameIneligible: boolean;
  becameEligible: boolean;
}

export interface SweepOutcome {
  draft: SimRule;
  holders: HolderImpact[];
  aggregates: {
    holderCount: number;
    eligibleBefore: number;
    eligibleAfter: number;
    newlyIneligible: number;
    newlyEligible: number;
    strandedValue: string;
    strandedPendingLegs: number;
    strandedPendingValue: string;
    reasonsAfter: Record<string, number>;
  };
}

export interface AuditEvent {
  at: number;
  kind: string;
  detail: Record<string, unknown>;
}

export interface BookState {
  assetId: string;
  holders: Holder[];
  policies: Policy[];
  distributions: Run[];
  events: AuditEvent[];
  mode: "server" | "demo";
  chain: "live" | "off";
}

const API = "/api/meridian";

/** The client engine: same semantics as the server, running on the seeded book.
 *  Used when no Meridian server is reachable (e.g. the standalone Vercel deploy).
 *  Every mutation it produces is tagged source:"demo" and badged in the UI. */
class DemoEngine {
  holders: Holder[];
  policies: Policy[];
  distributions: Run[];
  events: AuditEvent[] = [];
  assetId = demoBook.assetId;

  constructor() {
    this.holders = demoBook.holders.map((h) => ({ ...h, source: "demo" as const, verdict: Reason.None }));
    this.policies = demoBook.policies.map((p) => ({ ...p, cleanverse: { source: "demo" as const } }));
    this.distributions = demoBook.distributions.map((d) => ({
      ...d,
      legs: d.legs.map((l) => ({ ...l, state: l.state as Leg["state"], reason: l.reason as Reason })),
    }));
    this.reverdict();
    this.log("seed", { holders: this.holders.length, mode: "demo" });
  }

  private now(): number {
    return Math.floor(Date.now() / 1000);
  }

  private log(kind: string, detail: Record<string, unknown>): void {
    this.events.unshift({ at: Date.now(), kind, detail });
  }

  activeRule(): SimRule {
    return this.policies[this.policies.length - 1]!.rule;
  }

  reverdict(): void {
    const rule = this.activeRule();
    const t = this.now();
    for (const h of this.holders) h.verdict = evaluate(h, rule, t);
  }

  sweep(draft: SimRule): SweepOutcome {
    const baseline = this.activeRule();
    const t = this.now();
    const holders: HolderImpact[] = [];
    let eligibleBefore = 0,
      eligibleAfter = 0,
      newlyIneligible = 0,
      newlyEligible = 0,
      strandedValue = 0n;
    const reasonsAfter: Record<string, number> = {};
    for (const h of this.holders) {
      const before = evaluate(h, baseline, t);
      const after = evaluate(h, draft, t);
      if (before === Reason.None) eligibleBefore++;
      if (after === Reason.None) eligibleAfter++;
      const becameIneligible = before === Reason.None && after !== Reason.None;
      const becameEligible = before !== Reason.None && after === Reason.None;
      if (becameIneligible) {
        newlyIneligible++;
        strandedValue += BigInt(h.position);
      }
      if (becameEligible) newlyEligible++;
      if (after !== Reason.None) reasonsAfter[Reason[after]] = (reasonsAfter[Reason[after]] ?? 0) + 1;
      holders.push({
        wallet: h.wallet,
        name: h.name,
        cvRecordId: h.cvRecordId,
        tier: h.tier,
        country: h.country,
        position: h.position,
        before,
        after,
        becameIneligible,
        becameEligible,
      });
    }
    let strandedPendingLegs = 0,
      strandedPendingValue = 0n;
    for (const run of this.distributions)
      for (const leg of run.legs) {
        if (leg.state !== "pending") continue;
        const h = this.holders.find((x) => x.wallet === leg.wallet);
        if (h && evaluate(h, draft, t) !== Reason.None) {
          strandedPendingLegs++;
          strandedPendingValue += BigInt(leg.amount);
        }
      }
    this.log("sweep", { newlyIneligible });
    return {
      draft,
      holders,
      aggregates: {
        holderCount: holders.length,
        eligibleBefore,
        eligibleAfter,
        newlyIneligible,
        newlyEligible,
        strandedValue: strandedValue.toString(),
        strandedPendingLegs,
        strandedPendingValue: strandedPendingValue.toString(),
        reasonsAfter,
      },
    };
  }

  enact(draft: SimRule, memo: string): Policy {
    const version = this.policies.length + 1;
    const policy: Policy = {
      version,
      rule: draft,
      memo,
      enactedAt: this.now(),
      cleanverse: { source: "demo" },
    };
    this.policies.push(policy);
    this.reverdict();
    this.log("enact", { version, memo, source: "demo" });
    return policy;
  }

  setStatus(wallet: string, status: 1 | 2, reason?: string): void {
    const h = this.holders.find((x) => x.wallet === wallet);
    if (!h) return;
    h.status = status;
    this.reverdict();
    this.log(status === 2 ? "freeze" : "reactivate", { wallet, reason: reason ?? "", source: "demo" });
  }

  remediate(wallet: string): void {
    const h = this.holders.find((x) => x.wallet === wallet);
    if (!h) return;
    h.country = "SG";
    h.tier = Math.max(h.tier, this.activeRule().minTier);
    h.status = 1;
    h.expiry = this.now() + 180 * 86400;
    this.reverdict();
    this.log("reactivate", { wallet, via: "re-verification", source: "demo" });
  }

  payRun(id: number): Run | undefined {
    const run = this.distributions.find((d) => d.id === id);
    if (!run) return undefined;
    const rule = this.activeRule();
    const t = this.now();
    for (const leg of run.legs) {
      if (leg.state !== "pending") continue;
      const h = this.holders.find((x) => x.wallet === leg.wallet);
      const verdict = h ? evaluate(h, rule, t) : Reason.NotRegistered;
      leg.state = verdict === Reason.None ? "paid" : "suspended";
      leg.reason = verdict;
    }
    this.log("distribution:pay", { runId: id, source: "demo" });
    return run;
  }

  releaseLeg(id: number, legIndex: number): { ok: boolean; reason?: Reason } {
    const run = this.distributions.find((d) => d.id === id);
    const leg = run?.legs[legIndex];
    if (!run || !leg || leg.state !== "suspended") return { ok: false };
    const h = this.holders.find((x) => x.wallet === leg.wallet);
    const verdict = h ? evaluate(h, this.activeRule(), this.now()) : Reason.NotRegistered;
    if (verdict !== Reason.None) return { ok: false, reason: verdict };
    leg.state = "released";
    leg.reason = Reason.None;
    this.log("distribution:release", { runId: id, legIndex, source: "demo" });
    return { ok: true };
  }

  state(): BookState {
    return {
      assetId: this.assetId,
      holders: this.holders,
      policies: this.policies,
      distributions: this.distributions,
      events: this.events,
      mode: "demo",
      chain: "off",
    };
  }
}

let demo: DemoEngine | undefined;
export function demoEngine(): DemoEngine {
  demo ??= new DemoEngine();
  return demo;
}

async function fetchJson<T>(url: string, init?: RequestInit, timeoutMs = 4000): Promise<T> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ac.signal });
    if (!res.ok && res.status !== 409) throw new Error(`${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(t);
  }
}

/** Probe once per session whether a live Meridian server is reachable. */
export async function detectServer(): Promise<boolean> {
  try {
    await fetchJson(`${API}/status`, undefined, 2500);
    return true;
  } catch {
    return false;
  }
}

export const serverApi = {
  async book(): Promise<BookState> {
    const [b, status, events] = await Promise.all([
      fetchJson<{
        assetId: string;
        holders: Holder[];
        policies: Policy[];
        distributions: Run[];
      }>(`${API}/book`),
      fetchJson<{ chain: { mode: string } }>(`${API}/status`),
      fetchJson<AuditEvent[]>(`${API}/events`),
    ]);
    return {
      ...b,
      events,
      mode: "server",
      chain: status.chain.mode === "live" ? "live" : "off",
    };
  },
  sweep: (draft: Partial<SimRule>) =>
    fetchJson<SweepOutcome & { aggregates: SweepOutcome["aggregates"] }>(`${API}/sweep`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    }),
  enact: (draft: Partial<SimRule>, memo: string) =>
    fetchJson<{ enacted: Policy; sweep: SweepOutcome }>(`${API}/enact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...draft, memo }),
    }),
  freeze: (wallet: string, reason: string) =>
    fetchJson(`${API}/holders/${wallet}/freeze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    }),
  reactivate: (wallet: string) => fetchJson(`${API}/holders/${wallet}/reactivate`, { method: "POST" }),
  remediation: (wallet: string) => fetchJson<{ magiclink?: string; source: string }>(`${API}/holders/${wallet}/remediation`),
  proveTransfer: (fromIndex: number, toIndex: number) =>
    fetchJson<{ source: string; ok: boolean; txHash?: string; reason?: number; reasonLabel?: string }>(`${API}/prove-transfer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromIndex, toIndex }),
    }),
  payRun: (id: number) => fetchJson<{ run: Run; source: string; payTx?: string }>(`${API}/distributions/${id}/pay`, { method: "POST" }),
  releaseLeg: (id: number, leg: number) =>
    fetchJson<{ ok: boolean; source: string; tx?: string; reasonLabel?: string }>(`${API}/distributions/${id}/release/${leg}`, {
      method: "POST",
    }),
  evidence: (version: number) => fetchJson<Record<string, unknown>>(`${API}/evidence/${version}`),
  reconcile: () => fetchJson<{ rows: Array<Record<string, unknown>> }>(`${API}/reconcile`, { method: "POST" }),
};

export function fmtUsd(units: string | bigint, decimals = 6): string {
  const v = typeof units === "bigint" ? units : BigInt(units);
  const whole = v / 10n ** BigInt(decimals);
  return whole.toLocaleString("en-US");
}

export function shortAddr(a: string): string {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}
