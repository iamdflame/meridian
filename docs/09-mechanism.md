# 09 — MECHANISM ASCENSION: the named primitive

## The one-sentence primitive

> **Meridian is pre-enactment proof for on-chain compliance: the blast radius of any policy change is computed, proven identical to what the chain will enforce, and anchored before the rule becomes law.**

Name: **pre-enactment proofs** (the artifact) produced by the **blast-radius proof engine** (the mechanism). Meridian the console is the *interface to* this primitive — never the product.

## Why no top-10 one-liner can claim it

| Rival | Their tense | Ours |
|---|---|---|
| Venue — "eligibility-projected orderbook" | present (what may trade) | **future** (what a rule will do) |
| Plumb — "prove what compliance stopped" | past (refusal ledger) | future + anchored after |
| Tenor — "price credential-expiry as bonds" | decay (risk pricing) | pre-enactment (policy itself) |
| Covenant — "obligor counter-signs first" | origination | lifecycle |
| Pignora — "tier-haircut repo" | one instrument | all rules |
| STRATA — "per-position compliance" | where | when (before) |

The test: *"no top-10 entry can be described in this sentence."* ✓ — none predict a rule's effect before it exists; none prove the prediction binding.

## The composition census (how many of 155 could consume it)

A pre-enactment blast-radius proof is requestable by **any issuer or protocol that changes a rule on a gated asset**. From the report's own field:

- **59 named external projects** expose an explicit gated trading, credit, issuance, pool, settlement, or agent decision in their registered description. The full lower-bound table names every project and integration point in [`protocol-consumers.md`](protocol-consumers.md).
- **95 registrations are not counted** because their one-line public description does not establish a mutable gated rule. Meridian is the proof producer. Arithmetic: 59 + 95 + 1 = 155.
- Consumable via: the public `IPreEnactmentProof` Solidity interface, REST (`POST /api/skills/simulate_policy` + `query_book`), and the published Agent Skill.

This is deliberately a conservative lower bound, not an extrapolation from track labels.

## Propagation checklist

- [x] Name: "pre-enactment proofs" / "blast-radius proof engine"
- [x] Contracts: `IPreEnactmentProof` + tested `ProofGatedProtocol` consumer
- [x] Server: issuer anchors the exact sweep digest before enactment
- [x] UI: landing hero + studio header lead with the mechanism sentence
- [x] README first paragraph = the mechanism sentence
- [x] Description opens with it
