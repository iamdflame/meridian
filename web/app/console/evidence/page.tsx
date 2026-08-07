"use client";

import { useEffect, useState } from "react";
import { Button, EmptyState, HashPill, ProvenanceChip, Skeleton } from "@/components/ui";
import { useConsole } from "@/lib/console-context";

export default function EvidencePage() {
  const { book, evidence } = useConsole();
  const [version, setVersion] = useState<number | undefined>();
  const [pack, setPack] = useState<Record<string, unknown> | undefined>();

  useEffect(() => {
    if (book && version === undefined) setVersion(book.policies.length);
  }, [book, version]);

  useEffect(() => {
    if (version !== undefined) void evidence(version).then(setPack);
  }, [version, evidence]);

  if (!book) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const policy = pack?.policy as { version: number; memo: string; rule: Record<string, unknown>; cleanverseWrite?: { source: string; txHash?: string }; onchainAnchor?: { versionHash?: string; parentHash?: string; txHash?: string } } | undefined;
  const affected = (pack?.holdersAffected as Array<Record<string, unknown>>) ?? [];
  const trail = (pack?.auditTrail as Array<{ at: number; kind: string; detail: Record<string, unknown> }>) ?? [];
  const how = (pack?.verification as { how?: string[] })?.how ?? [];

  return (
    <div className="rise-stagger flex flex-col gap-4">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-[-0.02em]">Evidence Room</h1>
          <p className="mt-0.5 text-[13px] text-ink-3">The proof pack a regulator can verify — policy hash chain, affected holders, settlement receipts, audit trail.</p>
        </div>
        <div className="flex items-center gap-2">
          {book.policies.map((p) => (
            <button
              key={p.version}
              onClick={() => setVersion(p.version)}
              className="num cursor-pointer rounded-md px-2.5 py-1 text-[11px] transition-colors"
              style={version === p.version ? { background: "var(--bg-3)", color: "var(--brand-1)" } : { color: "var(--ink-3)" }}
            >
              v{p.version}
            </button>
          ))}
        </div>
      </header>

      {!pack || !policy ? (
        <EmptyState title="No evidence for this version" body="Enact a policy in the Studio to generate its pack." />
      ) : (
        <>
          <div className="grid grid-cols-[1fr_360px] gap-4 max-lg:grid-cols-1">
            <div className="panel flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="label">Policy</div>
                  <div className="mt-1 text-[15px] font-semibold">
                    v{policy.version} — {policy.memo}
                  </div>
                </div>
                <ProvenanceChip source={(policy.cleanverseWrite?.source as "live" | "fixture" | "demo") ?? "demo"} />
              </div>
              <pre className="num overflow-auto rounded-lg p-4 text-[11px] leading-relaxed text-ink-2" style={{ background: "var(--bg-0)" }}>
                {JSON.stringify(policy.rule, null, 2)}
              </pre>
              <div className="flex flex-wrap items-center gap-3">
                <span className="label">Anchor</span>
                {policy.onchainAnchor?.versionHash ? (
                  <>
                    <HashPill hash={policy.onchainAnchor.versionHash} />
                    <span className="text-[10px] text-ink-3">parent</span>
                    <HashPill hash={policy.onchainAnchor.parentHash ?? "0x0"} />
                    {policy.onchainAnchor.txHash && <HashPill hash={policy.onchainAnchor.txHash} />}
                  </>
                ) : (
                  <span className="text-[11px] text-ink-3">no chain anchor — demo/fixture mode (labeled, never faked)</span>
                )}
              </div>
              <div>
                <div className="label mb-2">Verify it yourself</div>
                <ol className="flex list-decimal flex-col gap-1.5 pl-4 text-[12px] leading-relaxed text-ink-2">
                  {how.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ol>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = `meridian-evidence-v${policy.version}.json`;
                  a.click();
                }}
              >
                Download pack (JSON)
              </Button>
            </div>

            <aside className="panel flex flex-col gap-2 p-5">
              <div className="label">Affected holders ({affected.length})</div>
              {affected.length === 0 && <div className="text-[12px] text-ink-3">No holders changed eligibility at this version.</div>}
              <div className="flex max-h-[300px] flex-col gap-1.5 overflow-auto">
                {affected.map((h, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: "var(--bg-2)" }}>
                    <span className="text-[12px] text-ink-1">{String(h.name)}</span>
                    <span className="num text-[10px]" style={{ color: "var(--danger-1)" }}>
                      {String(h.before)} → {String(h.after)}
                    </span>
                  </div>
                ))}
              </div>
            </aside>
          </div>

          <div className="panel overflow-hidden">
            <div className="label px-5 pt-4 pb-2">Audit trail — every operator and agent action</div>
            <div className="flex max-h-[320px] flex-col overflow-auto">
              {trail.slice(0, 40).map((e, i) => (
                <div key={i} className="flex items-baseline gap-4 px-5 py-2" style={{ borderTop: i ? "1px solid var(--line-1)" : "none" }}>
                  <span className="num w-20 shrink-0 text-[10px] text-ink-3">{new Date(e.at).toISOString().slice(11, 19)}</span>
                  <span className="num w-36 shrink-0 text-[11px] text-brand-1">{e.kind}</span>
                  <span className="num truncate text-[11px] text-ink-2">{JSON.stringify(e.detail)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
