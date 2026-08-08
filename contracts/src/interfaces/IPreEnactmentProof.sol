// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @title IPreEnactmentProof
/// @notice Public proof records that protocols can require before accepting an asset policy.
interface IPreEnactmentProof {
    struct ProofRecord {
        bytes32 proofHash;
        bytes32 ruleHash;
        bytes32 versionHash;
        bytes32 parentHash;
        uint64 affectedHolderCount;
        uint64 anchoredAt;
        uint64 enactedAt;
        uint256 strandedValue;
        bool consumed;
    }

    function proofByHash(bytes32 assetId, bytes32 proofHash) external view returns (ProofRecord memory);
    function proofAt(bytes32 assetId, uint256 version) external view returns (ProofRecord memory);
    function activeProof(bytes32 assetId) external view returns (ProofRecord memory);
}
