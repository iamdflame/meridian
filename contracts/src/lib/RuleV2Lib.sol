// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @title RuleV2Lib — single source of truth for Cleanverse-style eligibility semantics.
/// @notice Mirrors the five-dimensional RuleV2 model (group, sub-group, min tier,
///         min sub-tier, country allow/deny) plus credential status and expiry.
///         The TypeScript simulation engine implements these exact semantics; the
///         differential test suite asserts the two never drift.
library RuleV2Lib {
    /// @dev Credential status values mirror the A-Pass state field.
    uint8 internal constant STATUS_ACTIVE = 1;
    uint8 internal constant STATUS_FROZEN = 2;

    struct Holder {
        bytes32 cvRecordId; // stable identity key (off-chain resolved, keeper-attested)
        uint8 tier; // 0–99
        uint8 subTier; // 0–99
        bytes2 group;
        bytes2 subGroup;
        bytes2 country; // ISO2
        uint8 status; // 1 active, 2 frozen
        uint64 expiry; // unix seconds
        bool exists;
    }

    struct Rule {
        bytes2 group; // 0x0000 = any
        bytes2 subGroup; // 0x0000 = any
        uint8 minTier; // 0 = no minimum
        uint8 minSubTier; // 0 = no minimum
        bytes2[] countries; // interpretation depends on isBlackList
        bool isBlackList; // true → listed countries denied; false → listed = allow list (empty = any)
        bool active;
    }

    enum Reason {
        None, // eligible
        PolicyInactive,
        NotRegistered,
        CredentialFrozen,
        CredentialExpired,
        GroupMismatch,
        SubGroupMismatch,
        TierTooLow,
        SubTierTooLow,
        IneligibleCountry
    }

    /// @notice Evaluate a holder against a rule at a given time. Pure — no state reads.
    /// @dev Order of checks is part of the contract with the off-chain simulator:
    ///      registration → status → expiry → group → subGroup → tier → subTier → country.
    function evaluate(Holder memory h, Rule memory r, uint256 nowTs) internal pure returns (Reason) {
        if (!r.active) return Reason.PolicyInactive;
        if (!h.exists) return Reason.NotRegistered;
        if (h.status != STATUS_ACTIVE) return Reason.CredentialFrozen;
        // Monad timestamps are non-decreasing, not strictly increasing — use >= for validity.
        if (uint256(h.expiry) < nowTs) return Reason.CredentialExpired;
        if (r.group != bytes2(0) && h.group != r.group) return Reason.GroupMismatch;
        if (r.subGroup != bytes2(0) && h.subGroup != r.subGroup) return Reason.SubGroupMismatch;
        if (h.tier < r.minTier) return Reason.TierTooLow;
        if (h.subTier < r.minSubTier) return Reason.SubTierTooLow;

        uint256 n = r.countries.length;
        if (n > 0) {
            bool listed = false;
            for (uint256 i; i < n; ++i) {
                if (r.countries[i] == h.country) {
                    listed = true;
                    break;
                }
            }
            if (r.isBlackList && listed) return Reason.IneligibleCountry;
            if (!r.isBlackList && !listed) return Reason.IneligibleCountry;
        }
        return Reason.None;
    }

    /// @notice Canonical encoding of a rule — hashed into the policy chain.
    function encode(Rule memory r) internal pure returns (bytes memory) {
        return abi.encode(r.group, r.subGroup, r.minTier, r.minSubTier, r.countries, r.isBlackList, r.active);
    }
}
