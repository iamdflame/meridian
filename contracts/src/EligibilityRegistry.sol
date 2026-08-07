// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {AccessControl} from "openzeppelin-contracts/contracts/access/AccessControl.sol";
import {RuleV2Lib} from "./lib/RuleV2Lib.sol";

/// @title EligibilityRegistry — keeper-attested on-chain mirror of Cleanverse A-Pass state.
/// @notice Cleanverse resolves wallet → identity off-chain (query_apass → cvRecordId).
///         Contracts cannot make HTTP calls, so Meridian's keeper projects that state
///         on-chain. The identity graph is Cleanverse's; this projection is Meridian's.
/// @dev    Invariant: a wallet→cvRecordId binding, once set, never changes and never
///         clears. Freezing flips status only — identity must survive revocation, or
///         escrow claims and audit trails lose their subject.
contract EligibilityRegistry is AccessControl {
    bytes32 public constant KEEPER_ROLE = keccak256("KEEPER_ROLE");

    mapping(address wallet => RuleV2Lib.Holder) private _holders;
    address[] private _wallets;

    event HolderAttested(
        address indexed wallet, bytes32 indexed cvRecordId, uint8 tier, uint8 status, uint64 expiry, bytes2 country
    );

    error IdentityRebindForbidden(address wallet, bytes32 existing, bytes32 attempted);
    error UnknownWallet(address wallet);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(KEEPER_ROLE, admin);
    }

    /// @notice Attest (create or refresh) a holder's credential state from the Cleanverse API.
    function attest(
        address wallet,
        bytes32 cvRecordId,
        uint8 tier,
        uint8 subTier,
        bytes2 group,
        bytes2 subGroup,
        bytes2 country,
        uint8 status,
        uint64 expiry
    ) public onlyRole(KEEPER_ROLE) {
        RuleV2Lib.Holder storage h = _holders[wallet];
        if (h.exists) {
            if (h.cvRecordId != cvRecordId) revert IdentityRebindForbidden(wallet, h.cvRecordId, cvRecordId);
        } else {
            h.exists = true;
            h.cvRecordId = cvRecordId;
            _wallets.push(wallet);
        }
        h.tier = tier;
        h.subTier = subTier;
        h.group = group;
        h.subGroup = subGroup;
        h.country = country;
        h.status = status;
        h.expiry = expiry;
        emit HolderAttested(wallet, cvRecordId, tier, status, expiry, country);
    }

    struct Attestation {
        address wallet;
        bytes32 cvRecordId;
        uint8 tier;
        uint8 subTier;
        bytes2 group;
        bytes2 subGroup;
        bytes2 country;
        uint8 status;
        uint64 expiry;
    }

    /// @notice Batch attestation for keeper sync sweeps.
    function attestBatch(Attestation[] calldata batch) external onlyRole(KEEPER_ROLE) {
        for (uint256 i; i < batch.length; ++i) {
            Attestation calldata a = batch[i];
            attest(a.wallet, a.cvRecordId, a.tier, a.subTier, a.group, a.subGroup, a.country, a.status, a.expiry);
        }
    }

    /// @notice Fast status flip mirroring Cleanverse update_status (freeze/reactivate).
    function setStatus(address wallet, uint8 status) external onlyRole(KEEPER_ROLE) {
        RuleV2Lib.Holder storage h = _holders[wallet];
        if (!h.exists) revert UnknownWallet(wallet);
        h.status = status;
        emit HolderAttested(wallet, h.cvRecordId, h.tier, status, h.expiry, h.country);
    }

    function holderOf(address wallet) external view returns (RuleV2Lib.Holder memory) {
        return _holders[wallet];
    }

    function walletCount() external view returns (uint256) {
        return _wallets.length;
    }

    function walletAt(uint256 i) external view returns (address) {
        return _wallets[i];
    }
}
