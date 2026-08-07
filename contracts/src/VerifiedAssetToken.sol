// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {AccessControl} from "openzeppelin-contracts/contracts/access/AccessControl.sol";
import {EligibilityRegistry} from "./EligibilityRegistry.sol";
import {PolicyRegistry} from "./PolicyRegistry.sol";
import {RuleV2Lib} from "./lib/RuleV2Lib.sol";

/// @title VerifiedAssetToken — a policy-gated RWA note in the A-Token pattern.
/// @notice Every transfer evaluates BOTH legs live against the current policy and
///         credential state — never latched, so an expired or frozen holder is refused
///         from the moment their credential lapses, with a legible reason, not a bare revert.
/// @dev    _update is the single choke point: OZ v5 routes transfer/mint/burn through it
///         and _balances is private, so there is no bypass path.
contract VerifiedAssetToken is ERC20, AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    /// @dev Contracts exempt from holder checks (the distribution engine escrow leg).
    bytes32 public constant PROTOCOL_ROLE = keccak256("PROTOCOL_ROLE");

    EligibilityRegistry public immutable registry;
    PolicyRegistry public immutable policies;
    bytes32 public immutable assetId;

    error TransferIneligible(address wallet, RuleV2Lib.Reason reason);

    constructor(
        string memory name_,
        string memory symbol_,
        bytes32 assetId_,
        EligibilityRegistry registry_,
        PolicyRegistry policies_,
        address admin
    ) ERC20(name_, symbol_) {
        assetId = assetId_;
        registry = registry_;
        policies = policies_;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ISSUER_ROLE, admin);
    }

    function decimals() public pure override returns (uint8) {
        return 6; // aUSDC-denominated face units
    }

    function mint(address to, uint256 amount) external onlyRole(ISSUER_ROLE) {
        _mint(to, amount);
    }

    /// @notice Preflight used by UIs and the simulator's differential tests.
    function checkTransfer(address from, address to)
        public
        view
        returns (RuleV2Lib.Reason fromReason, RuleV2Lib.Reason toReason)
    {
        RuleV2Lib.Rule memory rule = policies.activeRule(assetId);
        fromReason = _eligibility(from, rule);
        toReason = _eligibility(to, rule);
    }

    function _eligibility(address wallet, RuleV2Lib.Rule memory rule) internal view returns (RuleV2Lib.Reason) {
        if (wallet == address(0)) return RuleV2Lib.Reason.None; // mint/burn legs
        if (hasRole(PROTOCOL_ROLE, wallet)) return RuleV2Lib.Reason.None; // registered protocol escrow
        return RuleV2Lib.evaluate(registry.holderOf(wallet), rule, block.timestamp);
    }

    function _update(address from, address to, uint256 value) internal override {
        RuleV2Lib.Rule memory rule = policies.activeRule(assetId);
        RuleV2Lib.Reason r = _eligibility(from, rule);
        if (r != RuleV2Lib.Reason.None) revert TransferIneligible(from, r);
        r = _eligibility(to, rule);
        if (r != RuleV2Lib.Reason.None) revert TransferIneligible(to, r);
        super._update(from, to, value);
    }
}
