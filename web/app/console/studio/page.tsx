"use client";

import { useMemo, useState } from "react";
import { BookMap } from "@/components/BookMap";
import { Button, HashPill, ProvenanceChip, Skeleton, StatCard } from "@/components/ui";
import { REASON_LABEL, Reason, fmtUsd, shortAddr, type SimRule, type SweepOutcome } from "@/lib/engine";
import { useConsole } from "@/lib/console-context";

const ALL_COUNTRIES = ["SG", "US", "GB", "DE", "JP", "NG", "BR", "IN", "KP", "IR"];

export default function StudioPage() {
  const { book, sweep, enact, proveTransfer } = useConsole();
  const active = book?.policies[book.policies.length - 1]?.rule;

  const [minTier, setMinTier] = useState<number | undefined>();
  const [countries, setCountries] = useState<string[] | undefined>();
  const [isBlackList, setIsBlackList] = useState<boolean | undefined>();
  const [result, setResult] = useState<SweepOutcome | undefined>();
  const [sweeping, setSweeping] = useState(false);
  const [enacting, setEnacting] = useState(false);
  const [enacted, setEnacted] = useState(false);
  const [proof, setProof] = useState<{ baseVersion?: number; before?: { ok: boolean; label?: string }; after?: { ok: boolean; label?: string; source?: string } }>({});

  const draft: SimRule | undefined = useMemo(() => {
    if (!active) return undefined;
    return {
      ...active,
      minTier: minTier ?? active.minTier,
      countries: countries ?? active.countries,
      isBlackList: isBlackList ?? active.isBlackList,
    };
  }, [active, minTier, countries, isBlackList]);

  const dirty = draft && active && JSON.stringify(draft) !== JSON.stringify(active);

  // proof-pair: an SG-eligible sender and the first holder the draft strands
  const proofPair = useMemo(() => {
    if (!book || !result) return undefined;
    const strandedImpact = result.holders.find((h) => h.becameIneligible);
    if (!strandedImpact) return undefined;
    const fromIdx = book.holders.findIndex((h) => h.verdict === Reason.None && h.country === "SG");
    const toIdx = book.holders.findIndex((h) => h.wallet === strandedImpact.wallet);
    if (fromIdx < 0 || toIdx < 0) return undefined;
    return { fromIdx, toIdx, name: strandedImpact.name };
  }, [book, result]);

  if (!book || !active || !draft) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-[420px] w-full" />
      </div>
    );
  }

  const runSweep = () => {
    setSweeping(true);
    setEnacted(false);
    setProof({});
    void sweep(draft).then((r) => {
      setResult(r);
      setTimeout(() => setSweeping(false), 1000);
    });
  };

  const runEnact = () => {
    if (!result) return;
    setEnacting(true);
    const memo = describeDraft(draft, active);
    void (async () => {
      const baseVersion = book.policies.length;
      if (proofPair) {
        const b = await proveTransfer(proofPair.fromIdx, proofPair.toIdx);
        setProof({ baseVersion, before: { ok: b.ok, ...(b.reasonLabel !== undefined ? { label: b.reasonLabel } : {}) } });
      }
      await enact(draft, memo);
      if (proofPair) {
        const a = await proveTransfer(proofPair.fromIdx, proofPair.toIdx);
        setProof((p) => ({ ...p, after: { ok: a.ok, ...(a.reasonLabel !== undefined ? { label: a.reasonLabel } : {}), source: a.source } }));
      }
      setEnacted(true);
      setEnacting(false);
    })();
  };

  const toggleCountry = (c: string) => {
    const cur = countries ?? active.countries;
    setCountries(cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]);
    setResult(undefined);
    setEnacted(false);
  };

  return (
    <div className="rise-stagger flex flex-col gap-4">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-[-0.02em]">Policy Studio</h1>
          <p className="mt-0.5 text-[13px] text-ink-3">Draft a rule. Sweep the full book. The blast-radius proof — identical to what the chain will enforce — is anchored before the policy becomes law.</p>
        </div>
        <div className="num text-[11px] text-ink-3">active: v{book.policies.length}</div>
      </header>

      <div className="grid grid-cols-[300px_1fr] gap-4 max-lg:grid-cols-1">
        {/* ── the draft ── */}
        <aside className="panel flex flex-col gap-5 p-5">
          <div>
            <div className="label mb-2">Minimum verification tier</div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={99}
                value={draft.minTier}
                onChange={(e) => {
                  setMinTier(Number(e.target.value));
                  setResult(undefined);
                  setEnacted(false);
                }}
                className="w-full accent-[var(--brand-1)]"
                aria-label="Minimum verification tier"
              />
              <span className="num w-8 text-right text-lg text-ink-1">{draft.minTier}</span>
            </div>
            {draft.minTier !== active.minTier && (
              <div className="num mt-1 text-[11px] text-brand-1">
                {active.minTier} → {draft.minTier}
              </div>
            )}
          </div>

          <div>
            <div className="label mb-2">Jurisdictions ({draft.isBlackList ? "deny list" : "allow list"})</div>
            <div className="flex flex-wrap gap-1.5">
              {ALL_COUNTRIES.map((c) => {
                const on = draft.countries.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => toggleCountry(c)}
                    className="num cursor-pointer rounded-md px-2 py-1 text-[11px] transition-all"
                    style={
                      on
                        ? { background: draft.isBlackList ? "var(--danger-bg)" : "var(--ok-bg)", color: draft.isBlackList ? "var(--danger-1)" : "var(--ok-1)", boxShadow: `0 0 0 1px ${draft.isBlackList ? "rgba(248,113,113,.3)" : "rgba(74,222,128,.3)"}` }
                        : { background: "var(--bg-2)", color: "var(--ink-3)" }
                    }
                  >
                    {c}
                  </button>
                );
              })}
            </div>
            <button
              className="mt-2 cursor-pointer text-[11px] text-ink-3 underline-offset-2 hover:underline"
              onClick={() => {
                setIsBlackList(!(isBlackList ?? active.isBlackList));
                setResult(undefined);
              }}
            >
              switch to {draft.isBlackList ? "allow-list" : "deny-list"} mode
            </button>
          </div>

          <div className="mt-1 flex flex-col gap-2">
            <Button variant="primary" onClick={runSweep} disabled={!dirty || sweeping}>
              {sweeping ? "Sweeping…" : "Run sweep"}
            </Button>
            <Button variant="danger" onClick={runEnact} disabled={!result || !dirty || enacting || enacted}>
              {enacting ? "Enacting…" : enacted ? "Enacted ✓" : `Enact as v${book.policies.length + 1}`}
            </Button>
            <p className="text-[10px] leading-relaxed text-ink-3">
              Enact writes the rule through Cleanverse <span className="num">atoken/set_rule</span>, anchors the version hash on Monad, and re-verdicts every holder. Simulated writes are labeled.
            </p>
          </div>
        </aside>

        {/* ── the sweep ── */}
        <div className="flex flex-col gap-3">
          <BookMap holders={book.holders} {...(result !== undefined ? { impacts: result.holders } : {})} sweeping={sweeping} draftMinTier={draft.minTier} />
          {result ? (
            <div className={`grid grid-cols-4 gap-3 max-md:grid-cols-2 ${!sweeping ? "settle" : ""}`}>
              <StatCard label="Newly ineligible" value={String(result.aggregates.newlyIneligible)} tone={result.aggregates.newlyIneligible > 0 ? "danger" : "ok"} sub={`${result.aggregates.eligibleBefore} → ${result.aggregates.eligibleAfter} eligible`} />
              <StatCard label="Value stranded" value={`$${fmtUsd(result.aggregates.strandedValue)}`} tone={BigInt(result.aggregates.strandedValue) > 0n ? "danger" : "ok"} sub="positions losing transferability" />
              <StatCard label="Coupons at risk" value={String(result.aggregates.strandedPendingLegs)} tone={result.aggregates.strandedPendingLegs > 0 ? "warn" : "ok"} sub={`$${fmtUsd(result.aggregates.strandedPendingValue)} would suspend`} />
              <StatCard label="Refusal mix" value={Object.entries(result.aggregates.reasonsAfter).length ? Object.entries(result.aggregates.reasonsAfter).map(([k, v]) => `${v} ${k}`).join(" · ") : "—"} sub="reasons after draft" />
            </div>
          ) : (
            <div className="panel px-5 py-4 text-[13px] text-ink-3">
              Adjust the draft, then <span className="text-ink-1">Run sweep</span> — every holder and pending coupon is re-evaluated under the exact RuleV2 semantics the chain enforces (differentially tested, 500 vectors).
            </div>
          )}
        </div>
      </div>

      {/* ── affected holders + on-chain proof ── */}
      {result && result.aggregates.newlyIneligible > 0 && (
        <div className="grid grid-cols-[1fr_360px] gap-4 max-lg:grid-cols-1">
          <div className="panel overflow-hidden">
            <div className="label px-5 pt-4 pb-2">Blast radius — {result.aggregates.newlyIneligible} holders</div>
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left" style={{ color: "var(--ink-3)" }}>
                  {["Holder", "Wallet", "Tier", "Country", "Position", "Verdict under draft"].map((h) => (
                    <th key={h} className="px-5 py-2 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.holders
                  .filter((h) => h.becameIneligible)
                  .slice(0, 8)
                  .map((h) => (
                    <tr key={h.wallet} style={{ borderTop: "1px solid var(--line-1)" }}>
                      <td className="px-5 py-2.5 text-ink-1">{h.name}</td>
                      <td className="num px-5 py-2.5 text-ink-3">{shortAddr(h.wallet)}</td>
                      <td className="num px-5 py-2.5 text-ink-2">{h.tier}</td>
                      <td className="num px-5 py-2.5 text-ink-2">{h.country}</td>
                      <td className="num px-5 py-2.5 text-ink-2">${fmtUsd(h.position)}</td>
                      <td className="px-5 py-2.5" style={{ color: "var(--danger-1)" }}>
                        {REASON_LABEL[h.after]}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <aside className="panel flex flex-col gap-3 p-5">
            <div className="label">The proof beat</div>
            <p className="text-[12px] leading-relaxed text-ink-2">
              On enact, Meridian sends the <em>same transfer</em> twice{proofPair ? ` — to ${proofPair.name}` : ""}: once before the policy, once after. The refusal comes from the token contract itself, not the UI.
            </p>
            {proof.before && (
              <div className="rise flex items-center justify-between rounded-lg px-3 py-2.5" style={{ background: "var(--ok-bg)" }}>
                <span className="text-[12px]" style={{ color: "var(--ok-1)" }}>
                  before · transfer settled
                </span>
                <span className="num text-[10px] text-ink-3">under v{proof.baseVersion ?? book.policies.length}</span>
              </div>
            )}
            {proof.after && (
              <div className="rise flex items-center justify-between rounded-lg px-3 py-2.5" style={{ background: "var(--danger-bg)" }}>
                <span className="text-[12px]" style={{ color: "var(--danger-1)" }}>
                  after · {proof.after.label ?? "blocked"}
                </span>
                <ProvenanceChip source={proof.after.source === "live" ? "live" : "demo"} chain={proof.after.source === "live"} />
              </div>
            )}
            {enacted && (
              <div className="mt-1 flex flex-col gap-1.5">
                <div className="label">Anchored</div>
                {book.policies[book.policies.length - 1]?.versionHash ? (
                  <HashPill hash={book.policies[book.policies.length - 1]!.versionHash!} />
                ) : (
                  <span className="text-[11px] text-ink-3">version hash pending chain deployment — see Evidence</span>
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

function describeDraft(draft: SimRule, active: SimRule): string {
  const parts: string[] = [];
  if (draft.minTier !== active.minTier) parts.push(`minTier ${active.minTier}→${draft.minTier}`);
  const added = draft.countries.filter((c) => !active.countries.includes(c));
  const removed = active.countries.filter((c) => !draft.countries.includes(c));
  if (added.length) parts.push(`${draft.isBlackList ? "blacklist" : "allow"} +${added.join("/")}`);
  if (removed.length) parts.push(`-${removed.join("/")}`);
  if (draft.isBlackList !== active.isBlackList) parts.push(`mode→${draft.isBlackList ? "deny" : "allow"}`);
  return parts.join(", ") || "policy update";
}
