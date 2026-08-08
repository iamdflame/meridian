---
name: meridian
description: Meridian issuer-console skill for compliance blast-radius analysis on Cleanverse verified assets. Use when an agent needs to check a verified-asset holder book, simulate a compliance policy change (jurisdiction blacklist, tier minimum, group restriction) before enactment, verify an active policy's public pre-enactment proof, quantify stranded value and affected holders, or fetch an audit evidence pack for an enacted policy version. Agents may DRAFT, SIMULATE, and VERIFY policies through this skill; ENACTMENT is reserved for human principals in the Meridian console — by design, this skill exposes no write endpoint.
---

# Meridian Skill

Meridian is mission control for verified-asset issuers on Cleanverse. This skill gives agents read and simulate access to an issuer's book.

## Security model

- All endpoints are read-only or pure-compute. There is **no** enact/write endpoint on this surface.
- Policy enactment requires a human principal in the Meridian console (server-side keeper signature). An agent may prepare the draft and hand the principal a sweep report.

## Endpoints

Base: `{MERIDIAN_BASE}/api/skills`

### query_book

`POST /query_book` — no params. Returns holder count, eligibility split, active policy, pending distribution totals.

### simulate_policy

`POST /simulate_policy` — body:

```json
{
  "minTier": 30,
  "countries": ["KP", "IR"],
  "isBlackList": true
}
```

All fields optional; omitted fields inherit the active policy. Returns the full differential sweep: per-holder before/after verdicts, newly ineligible holders, stranded value, distribution legs that would suspend — the blast radius, before anything is law.

### verify_policy_proof

`POST /verify_policy_proof` — no params. Returns the active policy's exact proof digest and independently reads `PolicyRegistry.activeProof(assetId)` when a chain deployment is configured. Treat `data.verified` as authoritative: fixture mode and registries without the public proof interface return `false`, never a simulated success.

Agent demo query:

```bash
curl -sS -X POST "${MERIDIAN_BASE}/api/skills/verify_policy_proof"
```

### get_evidence

`POST /get_evidence` — body `{ "version": 2 }`. Returns the audit evidence pack for an enacted policy version: rule, Cleanverse write evidence, on-chain anchor hashes, sweep-at-enactment, affected holders, distribution outcomes, and verification instructions.

## Workflow: pre-enactment review

1. `query_book` → current state.
2. `simulate_policy` with the proposed change.
3. If `aggregates.newlyIneligible > 0`, enumerate affected holders and prepare remediation notes (re-verification magiclinks are issued from the console).
4. Hand the sweep to the human principal for enactment in the Meridian console.
5. After enactment, call `verify_policy_proof` and require `data.verified === true` before a downstream protocol accepts the policy.
