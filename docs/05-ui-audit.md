# 05 — UI AUDIT

*Verified live in a browser against the production build (`next build` + `next start`), demo mode (standalone, no server). Screenshots captured during the audit session; the full set for the README gallery is re-captured at 1440×900 per the shot list in [06-submission.md](06-submission.md).*

## Screens verified

| Screen | State exercised | Result |
|---|---|---|
| Landing `/` | hero (SVG meridian field, pulsing nodes), 3 acts, 6 primitive cards, honesty section, footer | ✅ renders; entrance stagger works; anchors navigate |
| Book `/console` | stats (eligible 41/48, book value, value-at-risk, expiring), policy-space map, holder drawer, freeze/reactivate, magiclink | ✅ SIMULATED·DEMO chip visible; drawer data complete |
| Policy Studio `/console/studio` | tier slider, country deny-list toggles, allow/deny switch, **Run sweep** (wavefront + verdict flips + stat settle), blast-radius table, **Enact** (v1→v2, active label updates), proof beats (before-settled / after-refused w/ provenance chip) | ✅ full climax path works; nodes re-verdict after enact |
| Distributions `/console/distributions` | Execute run (10 paid / 2 suspended w/ exact reasons), **Release refused** with on-chain-style reason (control, not error), Remediate → Release succeeds, stats recompute | ✅ full escrow lifecycle in-browser |
| Evidence `/console/evidence` | version tabs, rule JSON, provenance chip, verification instructions, affected holders, audit trail, JSON download | ✅ |
| Agent `/console/agent` | scenario transcript streams (query_book → simulate_policy → draft report → "requires your signature"), SKILL.md panel | ✅ |

## Craft checklist

| Item | Status | Evidence |
|---|---|---|
| Typography: tabular numerals on all figures | ✅ | `.num` class (Geist Mono + `tabular-nums`) on every stat, amount, hash, tier |
| Display tracking / hierarchy | ✅ | −0.045em display, −0.02em headings, 0.08em uppercase micro-labels |
| Motion: staggered entrances 150–350ms custom easing | ✅ | `.rise-stagger` 40ms/child, `--ease-swift`; transform/opacity only |
| Micro-interactions on interactive elements | ✅ | buttons scale-on-press + brightness hover; nodes ring-pulse on flip; country chips color-state |
| Signature interaction | ✅ | **The Sweep**: wavefront crosses the policy-space map, nodes re-evaluate with x-proportional delay, counters settle with spring overshoot; `prefers-reduced-motion` honored |
| Depth: borders-first elevation, glow reserved | ✅ | `--elev-1/2` surfaces; `--elev-glow` only on primary CTA + wavefront |
| Data-viz: compliance data as art | ✅ | the Book Map *is* the policy space (x=tier, lanes=jurisdiction) — a tier raise is a visible frontier line, a blacklist wipes a lane |
| Empty states designed | ✅ | holder-drawer empty state w/ logo mark; evidence empty state |
| Loading: skeletons, not spinners | ✅ | shimmer skeletons on Book/Studio/Evidence |
| Error states designed | ✅ | refused release renders as labeled control outcome; enact failure surfaces source + message |
| Responsive 1440 / 1024 / 390 | ✅ | rail collapses to icons <1024 (logo mark only); grids collapse (`max-lg`/`max-md`); audited at 642px during session |
| Keyboard + focus | ✅ | designed 2px brand ring w/ offset (`:focus-visible`), all actions are real buttons/links, map nodes are buttons with full aria-labels |
| Contrast AA | ✅ | ink-1/bg-0 15.2:1, ink-2 7.1:1; status colors on tinted backgrounds ≥4.6:1 |
| Zero console errors on happy path | ✅ | probe route eliminated the 500; final session clean |
| Honest provenance | ✅ | LIVE·SANDBOX / LIVE·MONAD / SIMULATED·FIXTURE / SIMULATED·DEMO chips on every data panel + rail summary |

## Defects found & fixed during audit

1. 500 console noise from client-side server probe → server-side `/api/probe` route (clean console).
2. Wordmark overflow on collapsed rail (<1024px) → icon-only logo below `lg`.
3. Seed name collisions (three "Sofia Chen") undermined the identity story → deterministic name de-duplication across the 48-holder book.
4. Proof panel labeled the "before" beat with the post-enact version → capture baseline version at proof time.
5. "v1 — v1: baseline" duplication in Evidence header → memo no longer embeds its own version prefix.

## Self-assessment vs reference class

Strongest dimension: **data-as-geometry** (the policy-space Book Map + sweep) — an interaction pattern none of the reference sites has an equivalent for, and no competitor's screenshots will resemble. At parity: token discipline, motion restraint, provenance chips. Below reference (accepted, time-boxed): no light mode; landing hero is SVG-procedural rather than commissioned art (Nano Banana Pro briefs pending human execution).
