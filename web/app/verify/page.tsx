"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { formatUnits } from "viem";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HashPill } from "@/components/ui";

const DEFAULT_REGISTRY = "0xe522D342E3355B5cBA1fce3624B4403Ae1f8DED6";
const DEFAULT_ASSET = "MERIDIAN-NOTE-1";

type ProofResponse = {
  verified: boolean;
  code?: string;
  error?: string;
  chainId?: number;
  registry: string;
  asset: string;
  assetId: string;
  proof?: {
    proofHash: string;
    ruleHash: string;
    versionHash: string;
    parentHash: string;
    affectedHolderCount: string;
    anchoredAt: string;
    enactedAt: string;
    strandedValue: string;
    consumed: boolean;
  };
};

export default function VerifyPage() {
  const [registry, setRegistry] = useState(DEFAULT_REGISTRY);
  const [asset, setAsset] = useState(DEFAULT_ASSET);
  const [result, setResult] = useState<ProofResponse>();
  const [loading, setLoading] = useState(true);

  async function verify(nextRegistry = registry, nextAsset = asset) {
    setLoading(true);
    try {
      const query = new URLSearchParams({ registry: nextRegistry, asset: nextAsset });
      const response = await fetch(`/api/proof?${query}`, { cache: "no-store" });
      setResult((await response.json()) as ProofResponse);
    } catch {
      setResult({
        verified: false,
        registry: nextRegistry,
        asset: nextAsset,
        assetId: "unavailable",
        error: "The public Monad read could not be completed.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void verify(DEFAULT_REGISTRY, DEFAULT_ASSET);
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    void verify();
  }

  const proof = result?.proof;
  const tone = loading ? "var(--brand-1)" : result?.verified ? "var(--ok-1)" : "var(--warn-1)";
  const toneBg = loading ? "var(--brand-glow)" : result?.verified ? "var(--ok-bg)" : "var(--warn-bg)";

  return (
    <div className="min-h-screen">
      <header className="border-b" style={{ borderColor: "var(--line-1)", background: "var(--bg-1)" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/">
            <Logo size={22} withWord />
          </Link>
          <div className="flex items-center gap-4 text-[13px] text-ink-2">
            <Link href="/console/evidence" className="transition-colors hover:text-ink-1 max-sm:hidden">
              Evidence
            </Link>
            <a href="https://github.com/iamdflame/meridian" target="_blank" rel="noreferrer" className="transition-colors hover:text-ink-1 max-sm:hidden">
              Source
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 max-sm:px-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="label">Public proof verifier</div>
            <h1 className="mt-2 text-3xl font-semibold">Was this policy proven before enactment?</h1>
            <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-ink-2">
              Read the active proof directly from Monad. No login, wallet signature, or Meridian server trust.
            </p>
          </div>
          <span className="num rounded-md px-2 py-1 text-[10px] text-ok-1" style={{ background: "var(--ok-bg)" }}>
            PUBLIC ETH_CALL / CHAIN 10143
          </span>
        </div>

        <form onSubmit={submit} className="panel grid gap-4 p-5 md:grid-cols-[1fr_0.65fr_auto] md:items-end">
          <label className="min-w-0">
            <span className="label">Policy registry</span>
            <input
              value={registry}
              onChange={(event) => setRegistry(event.target.value)}
              spellCheck={false}
              className="num mt-2 w-full rounded-md border bg-bg-2 px-3 py-2.5 text-[12px] text-ink-1"
              style={{ borderColor: "var(--line-2)" }}
            />
          </label>
          <label className="min-w-0">
            <span className="label">Asset label or bytes32</span>
            <input
              value={asset}
              onChange={(event) => setAsset(event.target.value)}
              spellCheck={false}
              className="num mt-2 w-full rounded-md border bg-bg-2 px-3 py-2.5 text-[12px] text-ink-1"
              style={{ borderColor: "var(--line-2)" }}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md px-4 py-2.5 text-[13px] font-medium text-[#04121a] disabled:opacity-50"
            style={{ background: "var(--brand-1)", boxShadow: "var(--elev-glow)" }}
          >
            {loading ? "Reading Monad..." : "Verify proof"}
          </button>
        </form>

        <section className="overflow-hidden rounded-[var(--r-l)]" style={{ boxShadow: "var(--elev-1)" }}>
          <div className="flex items-center gap-3 px-5 py-4" style={{ background: toneBg }}>
            <span className="h-2 w-2 rounded-full" style={{ background: tone }} />
            <div>
              <div className="text-sm font-semibold" style={{ color: tone }}>
                {loading ? "Reading public state" : result?.verified ? "Pre-enactment proof verified" : "No verifiable active proof"}
              </div>
              <div className="mt-0.5 text-[11px] text-ink-2">
                {loading
                  ? "Calling activeProof(assetId) on Monad testnet."
                  : result?.verified
                    ? "The active policy is bound to a consumed proof anchored no later than enactment."
                    : result?.error ?? "The returned record did not satisfy the public proof checks."}
              </div>
            </div>
          </div>

          {!loading && result && (
            <div className="grid bg-bg-1 md:grid-cols-[0.8fr_1.2fr]">
              <div className="border-r p-5 max-md:border-r-0 max-md:border-b" style={{ borderColor: "var(--line-1)" }}>
                <div className="label">Query identity</div>
                <dl className="mt-4 grid gap-4 text-[12px]">
                  <div>
                    <dt className="text-ink-3">Registry</dt>
                    <dd className="mt-1"><HashPill hash={result.registry} href={`https://testnet.monadscan.com/address/${result.registry}`} /></dd>
                  </div>
                  <div>
                    <dt className="text-ink-3">Asset ID</dt>
                    <dd className="mt-1 break-all font-mono text-[11px] text-ink-2">{result.assetId}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-3">Trust required</dt>
                    <dd className="mt-1 text-ink-1">Public RPC only</dd>
                  </div>
                </dl>
              </div>

              <div className="p-5">
                {proof ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Metric label="Affected holders" value={proof.affectedHolderCount} />
                      <Metric label="Stranded value" value={`$${Number(formatUnits(BigInt(proof.strandedValue), 6)).toLocaleString()}`} />
                      <Metric label="Proof state" value={proof.consumed ? "Consumed" : "Unconsumed"} />
                    </div>
                    <div className="mt-6 grid gap-4 text-[12px] sm:grid-cols-2">
                      <HashRow label="Proof digest" hash={proof.proofHash} />
                      <HashRow label="Rule hash" hash={proof.ruleHash} />
                      <HashRow label="Version hash" hash={proof.versionHash} />
                      <HashRow label="Parent lineage" hash={proof.parentHash} />
                    </div>
                    <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 border-t pt-4 text-[11px] text-ink-3" style={{ borderColor: "var(--line-1)" }}>
                      <span>Anchored {formatTime(proof.anchoredAt)}</span>
                      <span>Enacted {formatTime(proof.enactedAt)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex min-h-48 flex-col justify-center">
                    <div className="label">Fail closed</div>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-2">
                      A holder cannot verify this policy from the supplied registry. The verifier does not substitute demo data or accept an issuer assertion.
                    </p>
                    <p className="mt-3 text-[11px] text-ink-3">
                      Try a proof-aware registry address or return after its public deployment.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="num mt-2 text-lg text-ink-1">{value}</div>
    </div>
  );
}

function HashRow({ label, hash }: { label: string; hash: string }) {
  return (
    <div>
      <div className="label mb-2">{label}</div>
      <HashPill hash={hash} />
    </div>
  );
}

function formatTime(value: string) {
  return new Date(Number(value) * 1000).toISOString().replace("T", " ").replace(".000Z", " UTC");
}