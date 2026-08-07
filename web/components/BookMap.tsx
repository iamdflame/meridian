"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Reason, REASON_LABEL, type Holder, type HolderImpact } from "@/lib/engine";

/**
 * The Book Map — Meridian's signature surface.
 * Layout is the policy space itself: x = verification tier (0–99),
 * lanes = jurisdiction. A tier raise is a vertical frontier moving right;
 * a country blacklist wipes a lane. Policy becomes geometry.
 *
 * During a sweep, a phosphor wavefront crosses left→right; each node
 * re-evaluates as the front passes (delay ∝ x). Reduced-motion: instant recolor.
 */

export interface MapNode {
  wallet: string;
  name: string;
  tier: number;
  country: string;
  status: number;
  expiry: number;
  position: string;
  verdict: Reason;
  after?: Reason;
  flipped?: boolean;
}

export function BookMap({
  holders,
  impacts,
  sweeping,
  draftMinTier,
  onSelect,
  selected,
}: {
  holders: Holder[];
  impacts?: HolderImpact[];
  sweeping: boolean;
  draftMinTier?: number;
  onSelect?: (wallet: string) => void;
  selected?: string;
}) {
  const [swept, setSwept] = useState(false);
  const prevSweep = useRef(false);

  useEffect(() => {
    if (sweeping && !prevSweep.current) {
      setSwept(false);
      const t = setTimeout(() => setSwept(true), 950);
      return () => clearTimeout(t);
    }
    if (!sweeping) setSwept(false);
    prevSweep.current = sweeping;
    return undefined;
  }, [sweeping]);

  const impactMap = useMemo(() => {
    const m = new Map<string, HolderImpact>();
    for (const i of impacts ?? []) m.set(i.wallet, i);
    return m;
  }, [impacts]);

  const lanes = useMemo(() => {
    const set = [...new Set(holders.map((h) => h.country))];
    set.sort();
    return set;
  }, [holders]);

  const laneH = 100 / Math.max(1, lanes.length);

  return (
    <div className="panel relative overflow-hidden" style={{ height: 420 }}>
      {/* tier gridlines */}
      {[0, 20, 40, 60, 80].map((t) => (
        <div key={t} className="absolute top-0 bottom-0" style={{ left: `${6 + (t / 100) * 88}%`, width: 1, background: "var(--line-1)" }}>
          <span className="label absolute -top-0.5 left-1.5 pt-2">{t}</span>
        </div>
      ))}
      <span className="label absolute right-3 bottom-2">verification tier →</span>

      {/* country lanes */}
      {lanes.map((c, i) => (
        <div key={c} className="absolute right-0 left-0" style={{ top: `${i * laneH}%`, height: `${laneH}%` }}>
          <span className="label absolute top-1/2 left-2 -translate-y-1/2">{c}</span>
          {i > 0 && <div className="absolute top-0 right-0 left-0" style={{ height: 1, background: "var(--line-1)" }} />}
        </div>
      ))}

      {/* draft tier frontier */}
      {draftMinTier !== undefined && draftMinTier > 0 && (
        <div
          className="absolute top-0 bottom-0 transition-[left] duration-300"
          style={{
            left: `${6 + (draftMinTier / 100) * 88}%`,
            width: 1.5,
            background: "var(--brand-1)",
            opacity: 0.6,
            boxShadow: "0 0 12px var(--brand-glow)",
          }}
        />
      )}

      {/* the wavefront */}
      {sweeping && !swept && (
        <div
          className="pointer-events-none absolute top-0 bottom-0 z-10"
          style={{
            left: 0,
            width: "12%",
            background: "linear-gradient(90deg, transparent, var(--brand-glow), transparent)",
            animation: "sweepacross 900ms var(--ease-swift) forwards",
          }}
        />
      )}
      <style>{`@keyframes sweepacross { from { transform: translateX(-10%);} to { transform: translateX(830%);} }
      @media (prefers-reduced-motion: reduce) { [style*="sweepacross"] { animation: none !important; opacity: 0; } }`}</style>

      {/* nodes */}
      {holders.map((h, idx) => {
        const lane = lanes.indexOf(h.country);
        const x = 6 + (Math.min(99, h.tier) / 100) * 88;
        // deterministic jitter inside the lane so clusters read as constellations
        const jitter = ((idx * 2654435761) % 1000) / 1000;
        const y = lane * laneH + laneH * (0.25 + jitter * 0.5);
        const impact = impactMap.get(h.wallet);
        const showAfter = impact && (swept || (!sweeping && impacts));
        const verdict = showAfter ? impact.after : h.verdict;
        const color =
          verdict === Reason.None
            ? "var(--ok-1)"
            : verdict === Reason.CredentialFrozen || verdict === Reason.CredentialExpired
              ? "var(--warn-1)"
              : "var(--danger-1)";
        const flipping = showAfter && impact.becameIneligible;
        const isSel = selected === h.wallet;
        const delay = sweeping && !swept ? `${(x / 100) * 800}ms` : "0ms";
        return (
          <button
            key={h.wallet}
            onClick={() => onSelect?.(h.wallet)}
            className="group absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full"
            style={{ left: `${x}%`, top: `${y}%`, width: 14, height: 14, background: "transparent" }}
            aria-label={`${h.name} — tier ${h.tier}, ${h.country}, ${REASON_LABEL[verdict]}`}
          >
            <span
              className={`block h-2 w-2 translate-x-[3px] rounded-full transition-colors ${flipping && swept ? "flip-danger" : ""}`}
              style={{
                background: color,
                transitionDelay: delay,
                transitionDuration: "200ms",
                boxShadow: isSel ? `0 0 0 3px ${color}44, 0 0 10px ${color}66` : `0 0 6px ${color}33`,
              }}
            />
            {/* hover card */}
            <span
              className="pointer-events-none absolute bottom-4 left-1/2 z-30 hidden w-44 -translate-x-1/2 rounded-lg p-2.5 text-left group-hover:block"
              style={{ background: "var(--bg-3)", boxShadow: "var(--elev-2)" }}
            >
              <span className="block text-[12px] font-medium text-ink-1">{h.name}</span>
              <span className="num block text-[10px] text-ink-3">
                tier {h.tier} · {h.country} · ${" "}
                {(BigInt(h.position) / 1_000_000n).toLocaleString("en-US")}
              </span>
              <span className="block pt-1 text-[10px]" style={{ color }}>
                {REASON_LABEL[verdict]}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
