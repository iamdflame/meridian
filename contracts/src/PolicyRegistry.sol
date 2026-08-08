// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {AccessControl} from "openzeppelin-contracts/contracts/access/AccessControl.sol";
import {IPreEnactmentProof} from "./interfaces/IPreEnactmentProof.sol";
import {RuleV2Lib} from "./lib/RuleV2Lib.sol";

/// @title PolicyRegistry — the anchor for Meridian's pre-enactment proofs.
/// @notice A blast-radius proof (computed off-chain, proven identical to what the
///         chain enforces) is meaningless unless the policy it predicted is bound
///         immutably on-chain. Every enacted version is hash-linked to its parent:
///         versionHash = keccak256(parentHash ‖ assetId ‖ encodedRule ‖ proofHash ‖ timestamp).
///         The chain is the tamper-evident spine that turns a simulation into a proof.
contract PolicyRegistry is AccessControl, IPreEnactmentProof {
    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");

    struct Version {
        bytes32 hash;
        bytes32 parentHash;
        bytes32 proofHash;
        uint64 enactedAt;
        string memo; // human-readable policy label, e.g. "v4: blacklist KP/IR, minTier 30"
    }

    mapping(bytes32 assetId => RuleV2Lib.Rule) private _active;
    mapping(bytes32 assetId => Version[]) private _versions;
    mapping(bytes32 assetId => mapping(bytes32 proofHash => ProofRecord)) private _proofs;

    event ProofAnchored(
        bytes32 indexed assetId,
        bytes32 indexed proofHash,
        bytes32 indexed ruleHash,
        bytes32 parentHash,
        uint64 affectedHolderCount,
        uint256 strandedValue
    );
    event PolicyEnacted(
        bytes32 indexed assetId, bytes32 indexed versionHash, bytes32 indexed proofHash, bytes32 parentHash, string memo
    );

    error NoActivePolicy(bytes32 assetId);
    error InvalidProofHash();
    error ProofAlreadyAnchored(bytes32 assetId, bytes32 proofHash);
    error ProofNotFound(bytes32 assetId, bytes32 proofHash);
    error ProofAlreadyConsumed(bytes32 assetId, bytes32 proofHash);
    error ProofRuleMismatch(bytes32 expected, bytes32 actual);
    error ProofLineageMismatch(bytes32 expected, bytes32 actual);

    modifier requiresAnchoredProof(bytes32 assetId, bytes32 proofHash) {
        _validateProof(assetId, proofHash);
        _;
    }

    function _validateProof(bytes32 assetId, bytes32 proofHash) private view {
        ProofRecord storage proof = _proofs[assetId][proofHash];
        if (proof.proofHash == bytes32(0)) revert ProofNotFound(assetId, proofHash);
        if (proof.consumed) revert ProofAlreadyConsumed(assetId, proofHash);
        bytes32 parentHash = _parentHash(assetId);
        if (proof.parentHash != parentHash) revert ProofLineageMismatch(proof.parentHash, parentHash);
    }

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(GOVERNOR_ROLE, admin);
    }

    /// @notice Anchor a blast-radius proof before its exact rule can be enacted.
    function anchorProof(
        bytes32 assetId,
        RuleV2Lib.Rule calldata rule,
        bytes32 proofHash,
        uint64 affectedHolderCount,
        uint256 strandedValue
    ) external onlyRole(GOVERNOR_ROLE) {
        if (proofHash == bytes32(0)) revert InvalidProofHash();
        if (_proofs[assetId][proofHash].proofHash != bytes32(0)) revert ProofAlreadyAnchored(assetId, proofHash);
        bytes32 ruleHash = hashRule(rule);
        bytes32 parentHash = _parentHash(assetId);
        _proofs[assetId][proofHash] = ProofRecord({
            proofHash: proofHash,
            ruleHash: ruleHash,
            versionHash: bytes32(0),
            parentHash: parentHash,
            affectedHolderCount: affectedHolderCount,
            anchoredAt: uint64(block.timestamp),
            enactedAt: 0,
            strandedValue: strandedValue,
            consumed: false
        });
        emit ProofAnchored(assetId, proofHash, ruleHash, parentHash, affectedHolderCount, strandedValue);
    }

    /// @notice Enact a policy only after its blast-radius proof has been publicly anchored.
    function enact(bytes32 assetId, RuleV2Lib.Rule calldata rule, string calldata memo, bytes32 proofHash)
        external
        onlyRole(GOVERNOR_ROLE)
        requiresAnchoredProof(assetId, proofHash)
        returns (bytes32 versionHash)
    {
        _validateRuleHash(assetId, proofHash, hashRule(rule));
        bytes32 parent = _parentHash(assetId);
        versionHash = keccak256(abi.encode(parent, assetId, RuleV2Lib.encode(rule), proofHash, block.timestamp));
        _active[assetId] = rule;
        _versions[assetId].push(
            Version({
                hash: versionHash,
                parentHash: parent,
                proofHash: proofHash,
                enactedAt: uint64(block.timestamp),
                memo: memo
            })
        );
        _consumeProof(assetId, proofHash, versionHash);
        emit PolicyEnacted(assetId, versionHash, proofHash, parent, memo);
    }

    function _validateRuleHash(bytes32 assetId, bytes32 proofHash, bytes32 actualRuleHash) private view {
        ProofRecord storage proof = _proofs[assetId][proofHash];
        if (proof.ruleHash != actualRuleHash) revert ProofRuleMismatch(proof.ruleHash, actualRuleHash);
    }

    function _consumeProof(bytes32 assetId, bytes32 proofHash, bytes32 versionHash) private {
        ProofRecord storage proof = _proofs[assetId][proofHash];
        proof.versionHash = versionHash;
        proof.enactedAt = uint64(block.timestamp);
        proof.consumed = true;
    }

    function hashRule(RuleV2Lib.Rule calldata rule) public pure returns (bytes32) {
        return keccak256(RuleV2Lib.encode(rule));
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

    function proofByHash(bytes32 assetId, bytes32 proofHash) external view returns (ProofRecord memory proof) {
        proof = _proofs[assetId][proofHash];
        if (proof.proofHash == bytes32(0)) revert ProofNotFound(assetId, proofHash);
    }

    function proofAt(bytes32 assetId, uint256 version) external view returns (ProofRecord memory) {
        return _proofs[assetId][_versions[assetId][version].proofHash];
    }

    function activeProof(bytes32 assetId) external view returns (ProofRecord memory) {
        Version[] storage vs = _versions[assetId];
        if (vs.length == 0) revert NoActivePolicy(assetId);
        return _proofs[assetId][vs[vs.length - 1].proofHash];
    }

    function supportsInterface(bytes4 interfaceId) public view override(AccessControl) returns (bool) {
        return interfaceId == type(IPreEnactmentProof).interfaceId || super.supportsInterface(interfaceId);
    }

    function _parentHash(bytes32 assetId) private view returns (bytes32) {
        Version[] storage vs = _versions[assetId];
        return vs.length == 0 ? bytes32(0) : vs[vs.length - 1].hash;
    }
}
