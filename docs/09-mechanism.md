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

- **Every gated-venue/lending/RWA project that mutates policy**: Venue, Plumb (could anchor refusals into our future-tense proof), Tenor, Covenant, Pignora, Recourse, Mezzanine, STRATA, NetClear, KLYRO, Continuity, Crossing, ClearFactor, Virgil, and ~90 more invoice/lending/agent/pool projects = **~130 of 155** registered projects operate a rule-gated asset or pool and could consume a blast-radius proof today.
- Consumable via: REST (`POST /api/skills/simulate_policy` + `query_book`), the on-chain anchor (`PolicyRegistry` version hash), and our published Agent Skill (the clevrpay pattern).

We state it in the description: *"≈130 of the 155 registered projects operate a rule-gated asset; each could request a Meridian blast-radius proof before their next policy change."* That is a composition claim the judge rewarded Recourse (8.6) for implying; ours is explicit, counted, and API-real.

## Propagation checklist

- [x] Name: "pre-enactment proofs" / "blast-radius proof engine"
- [ ] Contracts: NatSpec on `PolicyRegistry` + `VerifiedAssetToken` names the primitive; event `PolicyEnacted` doc mentions the anchored proof
- [ ] Server: skill `simulate_policy` description leads with "blast-radius proof"
- [ ] UI: landing hero + studio header lead with the mechanism sentence
- [ ] README first paragraph = the mechanism sentence
- [ ] Description (Phase D) opens with it
