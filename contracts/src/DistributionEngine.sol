// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {AccessControl} from "openzeppelin-contracts/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import {SafeERC20} from "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {EligibilityRegistry} from "./EligibilityRegistry.sol";
import {PolicyRegistry} from "./PolicyRegistry.sol";
import {RuleV2Lib} from "./lib/RuleV2Lib.sol";

/// @title DistributionEngine — coupon runs with per-leg re-verification and suspense escrow.
/// @notice Eligibility is checked at PAY time, per leg. Ineligible legs are not failed and
///         not skipped — they are SUSPENDED into escrow, re-checkable, and released once the
///         holder is eligible again ("money caught, not lost"). Exceptions become lifecycle.
/// @dev    Funding is pulled up-front so a run can never strand half-paid; legs are paid in
///         bounded pages (no unbounded push loops); CEI + ReentrancyGuard on all value moves.
contract DistributionEngine is AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    enum LegState {
        Pending,
        Paid,
        Suspended,
        Released
    }

    struct Leg {
        address holder;
        uint128 amount;
        LegState state;
        RuleV2Lib.Reason reason; // populated when suspended
    }

    struct Run {
        bytes32 assetId;
        IERC20 payoutToken; // the settlement asset (aUSDC-style)
        uint64 createdAt;
        uint128 total;
        uint128 escrowed; // sum of currently-suspended amounts
        uint32 legCount;
        uint32 paidCount;
        bool funded;
        string memo;
    }

    EligibilityRegistry public immutable registry;
    PolicyRegistry public immutable policies;

    uint256 public runCount;
    mapping(uint256 runId => Run) public runs;
    mapping(uint256 runId => Leg[]) private _legs;

    event RunCreated(uint256 indexed runId, bytes32 indexed assetId, uint256 total, uint256 legCount, string memo);
    event LegPaid(uint256 indexed runId, uint256 indexed legIndex, address indexed holder, uint256 amount);
    event LegSuspended(
        uint256 indexed runId, uint256 indexed legIndex, address indexed holder, uint256 amount, RuleV2Lib.Reason reason
    );
    event LegReleased(uint256 indexed runId, uint256 indexed legIndex, address indexed holder, uint256 amount);

    error LengthMismatch();
    error NotFunded(uint256 runId);
    error PageOutOfBounds();
    error LegNotSuspended(uint256 runId, uint256 legIndex);
    error StillIneligible(uint256 runId, uint256 legIndex, RuleV2Lib.Reason reason);

    constructor(EligibilityRegistry registry_, PolicyRegistry policies_, address admin) {
        registry = registry_;
        policies = policies_;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(OPERATOR_ROLE, admin);
    }

    /// @notice Create and fully fund a distribution run in one call (pull-funding).
    function createRun(
        bytes32 assetId,
        IERC20 payoutToken,
        address[] calldata holders,
        uint128[] calldata amounts,
        string calldata memo
    ) external onlyRole(OPERATOR_ROLE) nonReentrant returns (uint256 runId) {
        if (holders.length != amounts.length || holders.length == 0) revert LengthMismatch();
        runId = ++runCount;

        uint128 total;
        Leg[] storage legs = _legs[runId];
        for (uint256 i; i < holders.length; ++i) {
            total += amounts[i];
            legs.push(
                Leg({holder: holders[i], amount: amounts[i], state: LegState.Pending, reason: RuleV2Lib.Reason.None})
            );
        }

        runs[runId] = Run({
            assetId: assetId,
            payoutToken: payoutToken,
            createdAt: uint64(block.timestamp),
            total: total,
            escrowed: 0,
            legCount: uint32(holders.length),
            paidCount: 0,
            funded: true,
            memo: memo
        });

        emit RunCreated(runId, assetId, total, holders.length, memo);
        payoutToken.safeTransferFrom(msg.sender, address(this), total); // value move last (CEI)
    }

    /// @notice Pay a bounded page of legs, re-verifying each holder at pay time.
    /// @dev Ineligible legs suspend into escrow with the exact refusal reason.
    function payLegs(uint256 runId, uint256 from, uint256 to) external onlyRole(OPERATOR_ROLE) nonReentrant {
        Run storage run = runs[runId];
        if (!run.funded) revert NotFunded(runId);
        Leg[] storage legs = _legs[runId];
        if (from >= to || to > legs.length) revert PageOutOfBounds();

        RuleV2Lib.Rule memory rule = policies.activeRule(run.assetId);

        // Effects first: classify every leg in the page, then interact.
        uint256 n = to - from;
        address[] memory payTo = new address[](n);
        uint256[] memory payAmt = new uint256[](n);
        uint256 pays;

        for (uint256 i = from; i < to; ++i) {
            Leg storage leg = legs[i];
            if (leg.state != LegState.Pending) continue;
            RuleV2Lib.Reason reason = RuleV2Lib.evaluate(registry.holderOf(leg.holder), rule, block.timestamp);
            if (reason == RuleV2Lib.Reason.None) {
                leg.state = LegState.Paid;
                run.paidCount += 1;
                payTo[pays] = leg.holder;
                payAmt[pays] = leg.amount;
                ++pays;
                emit LegPaid(runId, i, leg.holder, leg.amount);
            } else {
                leg.state = LegState.Suspended;
                leg.reason = reason;
                run.escrowed += leg.amount;
                emit LegSuspended(runId, i, leg.holder, leg.amount, reason);
            }
        }

        for (uint256 i; i < pays; ++i) {
            run.payoutToken.safeTransfer(payTo[i], payAmt[i]);
        }
    }

    /// @notice Release a suspended leg after the holder becomes eligible again.
    /// @dev Permissionless: eligibility is re-proven on-chain, so anyone may trigger release.
    function releaseLeg(uint256 runId, uint256 legIndex) external nonReentrant {
        Run storage run = runs[runId];
        Leg storage leg = _legs[runId][legIndex];
        if (leg.state != LegState.Suspended) revert LegNotSuspended(runId, legIndex);

        RuleV2Lib.Rule memory rule = policies.activeRule(run.assetId);
        RuleV2Lib.Reason reason = RuleV2Lib.evaluate(registry.holderOf(leg.holder), rule, block.timestamp);
        if (reason != RuleV2Lib.Reason.None) revert StillIneligible(runId, legIndex, reason);

        leg.state = LegState.Released;
        leg.reason = RuleV2Lib.Reason.None;
        run.escrowed -= leg.amount;
        run.paidCount += 1;
        emit LegReleased(runId, legIndex, leg.holder, leg.amount);
        run.payoutToken.safeTransfer(leg.holder, leg.amount);
    }

    function legAt(uint256 runId, uint256 i) external view returns (Leg memory) {
        return _legs[runId][i];
    }

    function legsOf(uint256 runId) external view returns (Leg[] memory) {
        return _legs[runId];
    }
}
