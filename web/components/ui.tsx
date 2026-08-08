"use client";

import type { Provenance } from "@/lib/engine";

/** The honesty layer — every data panel names its source. */
export function ProvenanceChip({
  source,
  chain,
}: {
  source: Provenance | "live";
  chain?: boolean;
}) {
  const cfg =
    source === "live"
      ? chain
        ? { label: "LIVE · MONAD", color: "var(--ok-1)", bg: "var(--ok-bg)" }
        : { label: "LIVE · SANDBOX", color: "var(--ok-1)", bg: "var(--ok-bg)" }
      : source === "fixture"
        ? {
            label: "SIMULATED · FIXTURE",
            color: "var(--sim-1)",
            bg: "var(--sim-bg)",
          }
        : {
            label: "SIMULATED · DEMO",
            color: "var(--sim-1)",
            bg: "var(--sim-bg)",
          };
  return (
    <span
      className="num inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium tracking-[0.06em]"
      style={{ color: cfg.color, background: cfg.bg }}
      title={
        source === "live"
          ? "This panel reflects live external state"
          : "This panel is an honestly-labeled simulation"
      }
    >
      <span
        className="h-1 w-1 rounded-full"
        style={{ background: cfg.color }}
      />
      {cfg.label}
    </span>
  );
}

export function StatCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "ok" | "warn" | "danger";
}) {
  const color =
    tone === "danger"
      ? "var(--danger-1)"
      : tone === "warn"
        ? "var(--warn-1)"
        : tone === "ok"
          ? "var(--ok-1)"
          : "var(--ink-1)";
  return (
    <div className="panel min-w-0 px-5 py-4 max-md:px-3">
      <div className="label">{label}</div>
      <div
        className="num mt-1.5 text-2xl font-medium max-md:text-lg"
        style={{ color }}
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-ink-3">{sub}</div>}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = "default",
  disabled,
  type,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary" | "danger" | "ghost";
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const styles: Record<string, React.CSSProperties> = {
    default: {
      background: "var(--bg-2)",
      color: "var(--ink-1)",
      boxShadow: "var(--elev-1)",
    },
    primary: {
      background: "var(--brand-1)",
      color: "#04121a",
      boxShadow: "var(--elev-glow)",
    },
    danger: {
      background: "var(--danger-bg)",
      color: "var(--danger-1)",
      boxShadow: "0 0 0 1px rgba(248,113,113,0.3)",
    },
    ghost: { background: "transparent", color: "var(--ink-2)" },
  };
  return (
    <button
      type={type ?? "button"}
      onClick={onClick}
      disabled={disabled}
      className="cursor-pointer rounded-[10px] px-3.5 py-2 text-[13px] font-medium transition-[transform,opacity,filter] duration-150 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
      style={styles[variant]}
    >
      {children}
    </button>
  );
}

export function Verdict({ reason, label }: { reason: number; label: string }) {
  const tone =
    reason === 0
      ? { c: "var(--ok-1)", b: "var(--ok-bg)" }
      : reason === 3 || reason === 4
        ? { c: "var(--warn-1)", b: "var(--warn-bg)" }
        : { c: "var(--danger-1)", b: "var(--danger-bg)" };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ color: tone.c, background: tone.b }}
    >
      <span className="h-1 w-1 rounded-full" style={{ background: tone.c }} />
      {label}
    </span>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="panel flex flex-col items-center justify-center gap-2 px-8 py-16 text-center">
      <svg width="28" height="28" viewBox="0 0 64 64" fill="none" opacity={0.4}>
        <circle cx="32" cy="32" r="18" stroke="var(--ink-3)" strokeWidth="4" />
        <path
          d="M32 6 L32 20 M32 44 L32 58"
          stroke="var(--ink-3)"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <div className="text-sm font-medium text-ink-2">{title}</div>
      <div className="max-w-sm text-xs leading-relaxed text-ink-3">{body}</div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={`skeleton ${className ?? "h-4 w-24"}`} />;
}

export function HashPill({ hash, href }: { hash: string; href?: string }) {
  const short = `${hash.slice(0, 10)}…${hash.slice(-6)}`;
  const inner = (
    <span
      className="num inline-flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-ink-2 transition-colors hover:text-brand-1"
      style={{ background: "var(--bg-2)" }}
      onClick={() => void navigator.clipboard?.writeText(hash)}
      title={`${hash} — click to copy`}
    >
      {short}
    </span>
  );
  return href ? (
    <a href={href} target="_blank" rel="noreferrer">
      {inner}
    </a>
  ) : (
    inner
  );
}
