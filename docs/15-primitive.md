# 15 — THE PRIMITIVE

## No rule becomes law without a public proof

Meridian is not only an issuer console. `IPreEnactmentProof` is a public, permissionless contract interface that any protocol, holder, or agent can consume without trusting Meridian's server.

The invariant is mechanical:

1. Compute a content-addressed differential sweep over the exact candidate rule.
2. Call `anchorProof(assetId, rule, proofHash, affectedHolderCount, strandedValue)`.
3. Call `enact(assetId, rule, memo, proofHash)`.
4. `enact` rejects a missing, stale, mismatched, or already consumed proof.
5. The active policy exposes its consumed record through `activeProof(assetId)`.

The chain therefore distinguishes an issuer claim from an enacted, lineage-bound proof.

## Public interface

[`IPreEnactmentProof.sol`](../contracts/src/interfaces/IPreEnactmentProof.sol) exposes three reads:

```solidity
function proofByHash(bytes32 assetId, bytes32 proofHash) external view returns (ProofRecord memory);
function proofAt(bytes32 assetId, uint256 version) external view returns (ProofRecord memory);
function activeProof(bytes32 assetId) external view returns (ProofRecord memory);
```

Each record binds the proof digest, exact rule hash, policy version hash, parent lineage, affected-holder count, stranded value, anchor time, enactment time, and consumed state. `PolicyRegistry` advertises the interface through ERC-165.

## Five public actors

| Actor | Public surface | What it proves | In-window commit |
|---|---|---|---|
| Contract | [`PolicyRegistry.sol`](../contracts/src/PolicyRegistry.sol) + [`IPreEnactmentProof.sol`](../contracts/src/interfaces/IPreEnactmentProof.sol) | Enactment cannot bypass a matching pre-anchored proof | [`0efdeac`](https://github.com/iamdflame/meridian/commit/0efdeac) |
| Issuer | Shared canonical digest + ordered keeper writes + proof/evidence UI | The displayed sweep digest is the digest anchored before the exact rule is enacted | [`dd92caa`](https://github.com/iamdflame/meridian/commit/dd92caa) |
| Protocol | [`ProofGatedProtocol.sol`](../contracts/src/examples/ProofGatedProtocol.sol) + [59-project named census](protocol-consumers.md) | A downstream protocol can impose its own risk ceiling over the public record | [`289d173`](https://github.com/iamdflame/meridian/commit/289d173) |
| Holder | [Zero-auth verifier](https://meridian-three-olive.vercel.app/verify) | A holder can read the active record from Monad with no login, wallet, or issuer API | [`f975515`](https://github.com/iamdflame/meridian/commit/f975515) |
| Agent | [`verify_policy_proof`](../server/skill/SKILL.md) | An agent can verify but cannot enact; the skill has no policy write endpoint | [`7fa583f`](https://github.com/iamdflame/meridian/commit/7fa583f) |

Value does not concentrate in the console: the issuer produces a proof, the contract enforces ordering, protocols choose acceptance limits, holders inspect state, and agents verify read-only.

## Live proof

Proof-aware `PolicyRegistry`: [`0xe522D342E3355B5cBA1fce3624B4403Ae1f8DED6`](https://testnet.monadscan.com/address/0xe522D342E3355B5cBA1fce3624B4403Ae1f8DED6)

- Proof anchor: [`0x35cc…309d`](https://testnet.monadscan.com/tx/0x35cc7c80fcc15608334b97f26aa56d228214bd3baa597ee668ec2357f297309d), block 51886023.
- Policy enactment: [`0x4e19…ad44`](https://testnet.monadscan.com/tx/0x4e19a35ca7bd06071352d3ac285d96c6f06af8b39b82e76b6f543cec9d63ad44), block 51886029.
- Active proof: `0x1d0029616849c8dbc990f3685d09ad170517e8eb84d6866e30c67ac5d53e36a5`.
- Ordering: anchored at `1786171855`, enacted at `1786171856`, consumed `true`.

Reproduce without Meridian:

```bash
cast call 0xe522D342E3355B5cBA1fce3624B4403Ae1f8DED6 \
  'activeProof(bytes32)((bytes32,bytes32,bytes32,bytes32,uint64,uint64,uint64,uint256,bool))' \
  0x64b26d9579aad8dd4353b0d06fef4643eb23bb8b72e5eb99128583873836257a \
  --rpc-url https://testnet-rpc.monad.xyz
```

## Trust boundary

The primitive proves that a specific public sweep digest was anchored before, matched to, and consumed by the enacted rule and lineage. The committed evidence pack supplies the content addressed by that digest. It does not claim that external identity attestations are infallible; A-Pass and the keeper remain named trust inputs. Differential tests prove the TypeScript sweep and Solidity gate share RuleV2 semantics, while the public record makes the issuer's claimed impact independently inspectable.