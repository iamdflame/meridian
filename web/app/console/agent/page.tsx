"use client";

import { useState } from "react";
import { Button, Skeleton } from "@/components/ui";
import { fmtUsd, type SweepOutcome } from "@/lib/engine";
import { useConsole } from "@/lib/console-context";

/**
 * The Agent Surface — Meridian's own Agent Skill Framework integration,
 * mirroring the official cleanverseorg/clevrpay pattern: a SKILL.md plus
 * unauthenticated read/simulate endpoints. Agents draft; humans enact.
 */
export default function AgentPage() {
  const { book, sweep } = useConsole();
  const [transcript, setTranscript] = useState<Array<{ role: "agent" | "skill"; text: string }>>([]);
  const [running, setRunning] = useState(false);

  if (!book) return <Skeleton className="h-96 w-full" />;

  const runScenario = () => {
    setRunning(true);
    setTranscript([]);
    const push = (role: "agent" | "skill", text: string, delay: number) =>
      new Promise<void>((r) =>
        setTimeout(() => {
          setTranscript((t) => [...t, { role, text }]);
          r();
        }, delay),
      );
    void (async () => {
      await push("agent", "POST /api/skills/query_book — principal asked: “what happens if we raise the floor to tier 60?”", 300);
      const eligible = book.holders.filter((h) => h.verdict === 0).length;
      await push("skill", `{ holderCount: ${book.holders.length}, eligible: ${eligible}, activePolicy: v${book.policies.length} }`, 700);
      await push("agent", "POST /api/skills/simulate_policy { minTier: 60 }", 600);
      const result: SweepOutcome = await sweep({ ...book.policies[book.policies.length - 1]!.rule, minTier: 60 });
      await push(
        "skill",
        `{ newlyIneligible: ${result.aggregates.newlyIneligible}, strandedValue: $${fmtUsd(result.aggregates.strandedValue)}, couponLegsAtRisk: ${result.aggregates.strandedPendingLegs} }`,
        700,
      );
      await push(
        "agent",
        `Draft report to principal: raising minTier to 60 strands ${result.aggregates.newlyIneligible} holders ($${fmtUsd(result.aggregates.strandedValue)}). Recommend phased rollout + re-verification links first. NOTE: enactment requires your signature in the Studio — this surface cannot write.`,
        900,
      );
      setRunning(false);
    })();
  };

  return (
    <div className="rise-stagger flex flex-col gap-4">
      <header>
        <h1 className="text-xl font-semibold tracking-[-0.02em]">Agent Surface</h1>
        <p className="mt-0.5 text-[13px] text-ink-3">
          Meridian ships its own Agent Skill — the pattern Cleanverse itself uses for ClevrPay. Agents may query and simulate. Only a human principal can enact.
        </p>
      </header>

      <div className="grid grid-cols-[1fr_380px] gap-4 max-lg:grid-cols-1">
        <div className="panel flex min-h-[380px] flex-col gap-3 p-5">
          <div className="flex items-center justify-between">
            <div className="label">Live scenario — compliance analyst agent</div>
            <Button variant="primary" onClick={runScenario} disabled={running}>
              {running ? "Running…" : "Run agent scenario"}
            </Button>
          </div>
          <div className="flex flex-1 flex-col gap-2">
            {transcript.length === 0 && (
              <div className="flex flex-1 items-center justify-center text-[12px] text-ink-3">
                The agent will query the book, simulate a tier raise through the skill endpoints, and draft a report — live against this book.
              </div>
            )}
            {transcript.map((m, i) => (
              <div
                key={i}
                className="rise rounded-lg px-3.5 py-2.5 text-[12px] leading-relaxed"
                style={
                  m.role === "agent"
                    ? { background: "var(--bg-2)", color: "var(--ink-1)", marginRight: 40 }
                    : { background: "rgba(83,225,249,0.06)", color: "var(--ink-2)", marginLeft: 40, boxShadow: "0 0 0 1px rgba(83,225,249,0.15)" }
                }
              >
                <span className="label mr-2">{m.role === "agent" ? "agent" : "meridian skill"}</span>
                <span className="num">{m.text}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="panel flex flex-col gap-3 p-5">
          <div className="label">SKILL.md — published surface</div>
          <pre className="num overflow-auto rounded-lg p-4 text-[10.5px] leading-relaxed text-ink-2" style={{ background: "var(--bg-0)", maxHeight: 420 }}>
            {`name: meridian
description: issuer-console skill for
compliance blast-radius analysis on
Cleanverse verified assets…

endpoints (no auth, read/simulate only):
POST /api/skills/query_book
POST /api/skills/simulate_policy
POST /api/skills/get_evidence

security model:
- no enact/write endpoint exists
  on this surface, by design
- enactment = human principal,
  keeper-signed, in the console

workflow:
1. query_book
2. simulate_policy (draft)
3. enumerate affected holders
4. hand sweep to principal`}
          </pre>
          <p className="text-[10px] leading-relaxed text-ink-3">
            Served live at <span className="num">/api/skills/skill.md</span> on the Meridian server — installable by any ASF-compatible agent runtime.
          </p>
        </aside>
      </div>
    </div>
  );
}
