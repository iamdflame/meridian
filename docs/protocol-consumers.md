# Protocol consumers: the public proof primitive

`IPreEnactmentProof` is a three-read Solidity interface. A protocol can inspect the proof for the active policy, bind it to its own risk limits, and refuse an asset without trusting Meridian's server or console.

The executable example is [`ProofGatedProtocol.sol`](../contracts/src/examples/ProofGatedProtocol.sol). Its `requirePolicyProof(assetId, maxStrandedValue)` call requires a consumed active proof and rejects a published `strandedValue` above the caller's limit. [`ProofGatedProtocolTest`](../contracts/test/Meridian.t.sol) runs that integration against the real `PolicyRegistry`.

```solidity
bytes32 proofHash = proofGate.requirePolicyProof(assetId, 100_000e6);
```

## Registered-project census

Source: the 155 registrations transcribed in [`hackathon-judging-report.md`](../hackathon-judging-report.md), retrieved from the Cleanverse Projects tab on 2026-08-08.

Counting rule: include an external project only when its registered one-line description explicitly exposes a gated trading, credit, issuance, pool, settlement, or agent decision whose outcome can change when policy changes. Do not infer from track alone. Meridian is excluded because it produces the proof. Ambiguous registrations are excluded.

| Rule surface | Named count | Registered projects (report rank) | Where proof gates the consumer |
|---|---:|---|---|
| Trading and settlement | 11 | Venue (1), Plumb (2), NetClear (10), Crossing (15), CleanSettle (17), KLYRO (19), Conduit (27), CleanList (71), Para Liquid (86), veriflow AMM (97), BeanForQuote (130) | Before listing, routing, matching, liquidating, or settling an asset under a changed eligibility rule |
| Credit and collateral | 19 | Tenor (3), Covenant receivables (4), Pignora (5), Recourse (7), Mezzanine (8), Continuity (14), BackStop (40), Revoca (41), Covenant fixed-rate (44), Covenant fixed-income (45), Tessera (47), Nimbra (56), AVAL (57), VeriLend (103), VeriLend RWA (104), CleanCredit (105), TrustLend (109), ClearLend (133), SentinelGuard (140) | Before accepting collateral, repricing a tier, changing closeout eligibility, or originating against a governed asset |
| Issuance and asset lifecycle | 17 | Lien (11), Surety (12), Saksi (13), ClearFactor (18), Virgil (20), Keystone Protocol (21), Trellis (22), Quorum (31), Sevrin (33), Suspense (34), AMBIT (53), Veyra (63), ClearIssuance (68), CleanACE (70), EstateKey (82), SovereignX (123), RWA Issuance Platform (124) | Before minting, changing holder rights, changing jurisdiction rules, recalling lots, or distributing value |
| Pools, agents, and governance | 12 | STRATA (9), Warden treasury (23), SUTURE (26), Edict (28), VaultMind (43), Continuum (55), Certus (60), VeriAgent (61), CleanGraph (95), CleanTreasury AI (96), CivicMandate (110), Sentinel Compliance Agent (134) | Before an automated strategy, pool, or governed executor acts against a newly changed policy |
| **Conservative external lower bound** | **59** | **59 named registrations; no extrapolation** | **One public interface, caller-owned acceptance limits** |

Arithmetic: 59 named external consumers + Meridian as proof producer + 95 registrations not established by the public one-line evidence = 155. This is a conservative composition proof, not a market-size estimate.

## Consumer properties

- **Permissionless read:** no Meridian role, account, API key, or server is required.
- **Caller-owned policy:** the consumer chooses its own maximum affected value or other checks over the returned record.
- **Exact lineage:** `activeProof` returns the proof consumed by the active version, including its rule hash, version hash, and parent hash.
- **Discoverable:** `PolicyRegistry.supportsInterface(type(IPreEnactmentProof).interfaceId)` returns true.