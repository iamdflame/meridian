"use client";

import { useMemo, useState } from "react";
import { BookMap } from "@/components/BookMap";
import { Button, EmptyState, ProvenanceChip, Skeleton, StatCard, Verdict } from "@/components/ui";
import { Reason, REASON_LABEL, fmtUsd, shortAddr, type Holder } from "@/lib/engine";
import { useConsole } from "@/lib/console-context";

export default function BookPage() {
  const { book, freeze, reactivate, remediate } = useConsole();
  const [selected, setSelected] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [magiclink, setMagiclink] = useState<string | undefined>();

  const stats = useMemo(() => {
    if (!book) return undefined;
    const eligible = book.holders.filter((h) => h.verdict === Reason.None);
    const total = book.holders.reduce((a, h) => a + BigInt(h.position), 0n);
    const atRisk = book.holders.filter((h) => h.verdict !== Reason.None).reduce((a, h) => a + BigInt(h.position), 0n);
    const expiring = book.holders.filter((h) => h.expiry - Date.now() / 1000 < 14 * 86400 && h.verdict === Reason.None);
    return { eligible: eligible.length, total, atRisk, expiring: expiring.length };
  }, [book]);

  const holder: Holder | undefined = book?.holders.find((h) => h.wallet === selected);

  if (!book || !stats) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-4 gap-3 max-md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-[420px] w-full" />
      </div>
    );
  }

  return (
    <div className="rise-stagger flex flex-col gap-4">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-[-0.02em]">The Book</h1>
          <p className="mt-0.5 text-[13px] text-ink-3">
            {book.assetId} · every holder, credential, and position — evaluated live against policy v{book.policies.length}
          </p>
        </div>
        <ProvenanceChip source={book.mode === "server" ? (book.holders[0]?.source ?? "fixture") : "demo"} />
      </header>

      <div className="grid grid-cols-4 gap-3 max-md:grid-cols-2">
        <StatCard label="Holders eligible" value={`${stats.eligible} / ${book.holders.length}`} tone="ok" />
        <StatCard label="Book value" value={`$${fmtUsd(stats.total)}`} sub="face, 6dp settlement units" />
        <StatCard label="Value at risk" value={`$${fmtUsd(stats.atRisk)}`} tone={stats.atRisk > 0n ? "warn" : "ok"} sub="held by currently-ineligible wallets" />
        <StatCard label="Expiring ≤14d" value={String(stats.expiring)} tone={stats.expiring > 0 ? "warn" : "ok"} sub="credentials lapsing soon" />
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-4 max-lg:grid-cols-1">
        <BookMap holders={book.holders} sweeping={false} onSelect={setSelected} {...(selected !== undefined ? { selected } : {})} />

        {holder ? (
          <aside className="panel rise flex flex-col gap-3 p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[15px] font-semibold">{holder.name}</div>
                <div className="num text-[11px] text-ink-3">{shortAddr(holder.wallet)}</div>
              </div>
              <Verdict reason={holder.verdict} label={REASON_LABEL[holder.verdict]} />
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-[12px]">
              {(
                [
                  ["cvRecordId", holder.cvRecordId.slice(0, 14) + "…"],
                  ["Customer", holder.customerId],
                  ["Tier / Sub", `${holder.tier} / ${holder.subTier}`],
                  ["Group", `${holder.group}·${holder.subGroup}`],
                  ["Jurisdiction", holder.country],
                  ["Status", holder.status === 1 ? "Active" : "Frozen"],
                  ["Expiry", new Date(holder.expiry * 1000).toISOString().slice(0, 10)],
                  ["Position", `$${fmtUsd(holder.position)}`],
                ] as const
              ).map(([k, v]) => (
                <div key={k}>
                  <dt className="label">{k}</dt>
                  <dd className="num mt-0.5 text-ink-2">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-1 flex flex-wrap gap-2">
              {holder.status === 1 ? (
                <Button
                  variant="danger"
                  disabled={busy}
                  onClick={() => {
                    setBusy(true);
                    void freeze(holder.wallet, "manual review").finally(() => setBusy(false));
                  }}
                >
                  Freeze credential
                </Button>
              ) : (
                <Button
                  disabled={busy}
                  onClick={() => {
                    setBusy(true);
                    void reactivate(holder.wallet).finally(() => setBusy(false));
                  }}
                >
                  Reactivate
                </Button>
              )}
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => {
                  setBusy(true);
                  void remediate(holder.wallet)
                    .then((r) => setMagiclink(r.magiclink))
                    .finally(() => setBusy(false));
                }}
              >
                Issue re-verification link
              </Button>
            </div>
            {magiclink && (
              <a href={magiclink} target="_blank" rel="noreferrer" className="num truncate rounded-lg px-3 py-2 text-[11px] text-brand-1" style={{ background: "var(--bg-2)" }}>
                {magiclink}
              </a>
            )}
            <p className="text-[10px] leading-relaxed text-ink-3">
              Freeze writes through Cleanverse <span className="num">update_status</span> and the on-chain registry; the transfer gate reads it live — no latching.
            </p>
          </aside>
        ) : (
          <EmptyState title="Select a holder" body="Click any node on the map. The panel shows the full credential record and the enactable levers — freeze, reactivate, re-verification." />
        )}
      </div>
    </div>
  );
}
