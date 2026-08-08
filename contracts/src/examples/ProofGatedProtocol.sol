// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IPreEnactmentProof} from "../interfaces/IPreEnactmentProof.sol";

/// @notice Minimal integration for protocols that require proven policy impact.
contract ProofGatedProtocol {
    error UnprovenPolicy(bytes32 assetId);
    error ImpactLimitExceeded(uint256 actual, uint256 limit);

    IPreEnactmentProof public immutable proofRegistry;

    constructor(IPreEnactmentProof registry) {
        proofRegistry = registry;
    }

    function requirePolicyProof(bytes32 assetId, uint256 maxStrandedValue) external view returns (bytes32 proofHash) {
        IPreEnactmentProof.ProofRecord memory proof = proofRegistry.activeProof(assetId);
        if (!proof.consumed || proof.proofHash == bytes32(0)) revert UnprovenPolicy(assetId);
        if (proof.strandedValue > maxStrandedValue) {
            revert ImpactLimitExceeded(proof.strandedValue, maxStrandedValue);
        }
        return proof.proofHash;
    }
}