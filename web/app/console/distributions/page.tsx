"use client";

import { useState } from "react";
import { Button, EmptyState, Skeleton, StatCard, Verdict } from "@/components/ui";
import { REASON_LABEL, fmtUsd, shortAddr, type Run } from "@/lib/engine";
import { useConsole } from "@/lib/console-context";

export default function DistributionsPage() {
  const { book, payRun, releaseLeg, remediate, reactivate } = useConsole();
  const [busy, setBusy] = useState(false);
  const [releaseError, setReleaseError] = useState<Record<number, string>>({});

  if (!book) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const run: Run | undefined = book.distributions[0];
  if (!run) return <EmptyState title="No distributions" body="Seed the book to schedule a coupon run." />;

  const paid = run.legs.filter((l) => l.state === "paid" || l.state === "released");
  const suspended = run.legs.filter((l) => l.state === "suspended");
  const pending = run.legs.filter((l) => l.state === "pending");
  const totalOf = (legs: typeof run.legs) => legs.reduce((a, l) => a + BigInt(l.amount), 0n);

  return (
    <div className="rise-stagger flex flex-col gap-4">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-[-0.02em]">Distributions</h1>
          <p className="mt-0.5 text-[13px] text-ink-3">{run.memo} — every leg re-verified at pay time. Ineligible legs suspend into escrow: money caught, not lost.</p>
        </div>
        {pending.length > 0 && (
          <Button
            variant="primary"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              void payRun(run.id).finally(() => setBusy(false));
            }}
          >
            {busy ? "Paying…" : `Execute run (${pending.length} legs)`}
          </Button>
        )}
      </header>

      <div className="grid grid-cols-4 gap-3 max-md:grid-cols-2">
        <StatCard label="Legs" value={String(run.legs.length)} sub={`$${fmtUsd(totalOf(run.legs))} total`} />
        <StatCard label="Paid" value={String(paid.length)} tone="ok" sub={`$${fmtUsd(totalOf(paid))}`} />
        <StatCard label="In suspense escrow" value={String(suspended.length)} tone={suspended.length ? "warn" : "ok"} sub={`$${fmtUsd(totalOf(suspended))} recoverable`} />
        <StatCard label="Pending" value={String(pending.length)} sub="await execution" />
      </div>

      <div className="panel overflow-hidden">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-left" style={{ color: "var(--ink-3)" }}>
              {["Beneficiary", "Amount", "State", "Reason at pay-time", ""].map((h, i) => (
                <th key={i} className="px-5 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {run.legs.map((leg, i) => {
              const holder = book.holders.find((h) => h.wallet === leg.wallet);
              return (
                <tr key={i} style={{ borderTop: "1px solid var(--line-1)" }}>
                  <td className="px-5 py-3">
                    <div className="text-ink-1">{holder?.name ?? "—"}</div>
                    <div className="num text-[10px] text-ink-3">{shortAddr(leg.wallet)}</div>
                  </td>
                  <td className="num px-5 py-3 text-ink-1">${fmtUsd(leg.amount)}</td>
                  <td className="px-5 py-3">
                    <Verdict
                      reason={leg.state === "paid" || leg.state === "released" ? 0 : leg.state === "suspended" ? 3 : 1}
                      label={leg.state}
                    />
                  </td>
                  <td className="px-5 py-3 text-ink-2">{leg.state === "suspended" ? REASON_LABEL[leg.reason] : leg.state === "released" ? "released after re-verification" : leg.state === "paid" ? "eligible" : "—"}</td>
                  <td className="px-5 py-3 text-right">
                    {leg.state === "suspended" && (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          disabled={busy}
                          onClick={() => {
                            setBusy(true);
                            // remediation: re-verify (magiclink flow) then reactivate → release re-proves on-chain
                            void remediate(leg.wallet)
                              .then(() => reactivate(leg.wallet))
                              .finally(() => setBusy(false));
                          }}
                        >
                          Remediate
                        </Button>
                        <Button
                          disabled={busy}
                          onClick={() => {
                            setBusy(true);
                            setReleaseError((e) => ({ ...e, [i]: "" }));
                            void releaseLeg(run.id, i)
                              .then((r) => {
                                if (!r.ok) setReleaseError((e) => ({ ...e, [i]: r.reasonLabel ?? "still ineligible" }));
                              })
                              .finally(() => setBusy(false));
                          }}
                        >
                          Release
                        </Button>
                      </div>
                    )}
                    {releaseError[i] && <div className="mt-1 text-[10px]" style={{ color: "var(--danger-1)" }}>{releaseError[i]} — release refused on-chain</div>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] leading-relaxed text-ink-3">
        Release is permissionless by design — eligibility is re-proven by the contract at claim time, so a refused release is a working control, not an error. Escrow invariant: <span className="num">sum(escrowed) == sum(suspended legs)</span>, enforced in the Foundry suite.
      </p>
    </div>
  );
}
