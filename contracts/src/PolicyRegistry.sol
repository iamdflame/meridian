// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {AccessControl} from "openzeppelin-contracts/contracts/access/AccessControl.sol";
import {RuleV2Lib} from "./lib/RuleV2Lib.sol";

/// @title PolicyRegistry — the anchor for Meridian's pre-enactment proofs.
/// @notice A blast-radius proof (computed off-chain, proven identical to what the
///         chain enforces) is meaningless unless the policy it predicted is bound
///         immutably on-chain. Every enacted version is hash-linked to its parent:
///         versionHash = keccak256(parentHash ‖ assetId ‖ encodedRule ‖ timestamp).
///         The chain is the tamper-evident spine that turns a simulation into a proof.
contract PolicyRegistry is AccessControl {
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");

    struct Version {
        bytes32 hash;
        bytes32 parentHash;
        uint64 enactedAt;
        string memo; // human-readable policy label, e.g. "v4: blacklist KP/IR, minTier 30"
    }

    mapping(bytes32 assetId => RuleV2Lib.Rule) private _active;
    mapping(bytes32 assetId => Version[]) private _versions;

    event PolicyEnacted(bytes32 indexed assetId, bytes32 indexed versionHash, bytes32 parentHash, string memo);

    error NoActivePolicy(bytes32 assetId);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(GOVERNOR_ROLE, admin);
    }

    /// @notice Enact a new policy version for an asset. Anchors the hash chain on-chain.
    function enact(bytes32 assetId, RuleV2Lib.Rule calldata rule, string calldata memo)
        external
        onlyRole(GOVERNOR_ROLE)
        returns (bytes32 versionHash)
    {
        Version[] storage vs = _versions[assetId];
        bytes32 parent = vs.length == 0 ? bytes32(0) : vs[vs.length - 1].hash;
        versionHash = keccak256(abi.encode(parent, assetId, RuleV2Lib.encode(rule), block.timestamp));
        _active[assetId] = rule;
        vs.push(Version({hash: versionHash, parentHash: parent, enactedAt: uint64(block.timestamp), memo: memo}));
        emit PolicyEnacted(assetId, versionHash, parent, memo);
    }

    function activeRule(bytes32 assetId) external view returns (RuleV2Lib.Rule memory r) {
        r = _active[assetId];
        if (!r.active) revert NoActivePolicy(assetId);
    }

    function hasActiveRule(bytes32 assetId) external view returns (bool) {
        return _active[assetId].active;
    }

    function versionCount(bytes32 assetId) external view returns (uint256) {
        return _versions[assetId].length;
    }

    function versionAt(bytes32 assetId, uint256 i) external view returns (Version memory) {
        return _versions[assetId][i];
    }
}
