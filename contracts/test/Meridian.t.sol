// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";
import {EligibilityRegistry} from "../src/EligibilityRegistry.sol";
import {PolicyRegistry} from "../src/PolicyRegistry.sol";
import {VerifiedAssetToken} from "../src/VerifiedAssetToken.sol";
import {DistributionEngine} from "../src/DistributionEngine.sol";
import {SettlementToken} from "../src/SettlementToken.sol";
import {IPreEnactmentProof} from "../src/interfaces/IPreEnactmentProof.sol";
import {RuleV2Lib} from "../src/lib/RuleV2Lib.sol";

/// Shared fixture: admin-operated registry + policy + gated note + engine + cash leg.
contract Base is Test {
    EligibilityRegistry reg;
    PolicyRegistry pol;
    VerifiedAssetToken note;
    DistributionEngine engine;
    SettlementToken cash;

    bytes32 constant ASSET = keccak256("MERIDIAN-NOTE-1");
    address admin = makeAddr("admin");
    address alice = makeAddr("alice"); // SG, tier 40
    address bob = makeAddr("bob"); // US, tier 20
    address carol = makeAddr("carol"); // KP, tier 60 (sanctioned country in v2 policy)

    function setUp() public virtual {
        vm.startPrank(admin);
        reg = new EligibilityRegistry(admin);
        pol = new PolicyRegistry(admin);
        note = new VerifiedAssetToken("Meridian Note", "mNOTE", ASSET, reg, pol, admin);
        cash = new SettlementToken(admin);
        engine = new DistributionEngine(reg, pol, admin);
        note.grantRole(note.PROTOCOL_ROLE(), address(engine));

        // Baseline policy v1: minTier 10, no country restriction.
        _anchorAndEnact(_rule(10, 0, new bytes2[](0), true), "v1: baseline");

        _attest(alice, "alice", 40, "SG");
        _attest(bob, "bob", 20, "US");
        _attest(carol, "carol", 60, "KP");
        vm.stopPrank();
    }

    function _rule(uint8 minTier, uint8 minSubTier, bytes2[] memory countries, bool isBlackList)
        internal
        pure
        returns (RuleV2Lib.Rule memory)
    {
        return RuleV2Lib.Rule({
            group: bytes2(0),
            subGroup: bytes2(0),
            minTier: minTier,
            minSubTier: minSubTier,
            countries: countries,
            isBlackList: isBlackList,
            active: true
        });
    }

    function _attest(address wallet, string memory id, uint8 tier, bytes2 country) internal {
        reg.attest(
            wallet,
            keccak256(bytes(id)),
            tier,
            0,
            bytes2("AB"),
            bytes2("AB"),
            country,
            1,
            uint64(block.timestamp + 30 days)
        );
    }

    function _countries(bytes2 a) internal pure returns (bytes2[] memory c) {
        c = new bytes2[](1);
        c[0] = a;
    }

    function _anchorAndEnact(RuleV2Lib.Rule memory rule, string memory memo) internal returns (bytes32) {
        bytes32 proofHash = keccak256(abi.encode(ASSET, pol.versionCount(ASSET), rule, memo));
        pol.anchorProof(ASSET, rule, proofHash, 0, 0);
        return pol.enact(ASSET, rule, memo, proofHash);
    }
}

contract RuleV2LibTest is Base {
    using RuleV2Lib for RuleV2Lib.Rule;

    function _holder(uint8 tier, uint8 status, uint64 expiry, bytes2 country)
        internal
        pure
        returns (RuleV2Lib.Holder memory)
    {
        return RuleV2Lib.Holder({
            cvRecordId: bytes32(uint256(1)),
            tier: tier,
            subTier: 20,
            group: bytes2("AB"),
            subGroup: bytes2("AB"),
            country: country,
            status: status,
            expiry: expiry,
            exists: true
        });
    }

    function test_matrix_eligible() public view {
        RuleV2Lib.Rule memory r = _rule(30, 0, _countries(bytes2("KP")), true);
        assertEq(
            uint8(RuleV2Lib.evaluate(_holder(30, 1, uint64(block.timestamp), "SG"), r, block.timestamp)),
            uint8(RuleV2Lib.Reason.None)
        );
    }

    function test_matrix_everyRefusalReason() public view {
        bytes2[] memory kp = _countries(bytes2("KP"));
        RuleV2Lib.Rule memory r = _rule(30, 10, kp, true);
        uint256 t = block.timestamp;

        RuleV2Lib.Holder memory missing;
        assertEq(uint8(RuleV2Lib.evaluate(missing, r, t)), uint8(RuleV2Lib.Reason.NotRegistered));
        assertEq(
            uint8(RuleV2Lib.evaluate(_holder(40, 2, uint64(t + 1), "SG"), r, t)),
            uint8(RuleV2Lib.Reason.CredentialFrozen)
        );
        assertEq(
            uint8(RuleV2Lib.evaluate(_holder(40, 1, uint64(t - 1), "SG"), r, t)),
            uint8(RuleV2Lib.Reason.CredentialExpired)
        );
        assertEq(
            uint8(RuleV2Lib.evaluate(_holder(29, 1, uint64(t + 1), "SG"), r, t)), uint8(RuleV2Lib.Reason.TierTooLow)
        );

        RuleV2Lib.Holder memory lowSub = _holder(40, 1, uint64(t + 1), "SG");
        lowSub.subTier = 9;
        assertEq(uint8(RuleV2Lib.evaluate(lowSub, r, t)), uint8(RuleV2Lib.Reason.SubTierTooLow));

        assertEq(
            uint8(RuleV2Lib.evaluate(_holder(40, 1, uint64(t + 1), "KP"), r, t)),
            uint8(RuleV2Lib.Reason.IneligibleCountry)
        );

        RuleV2Lib.Rule memory allowOnly = _rule(0, 0, _countries(bytes2("SG")), false);
        assertEq(
            uint8(RuleV2Lib.evaluate(_holder(40, 1, uint64(t + 1), "US"), allowOnly, t)),
            uint8(RuleV2Lib.Reason.IneligibleCountry)
        );
        assertEq(
            uint8(RuleV2Lib.evaluate(_holder(40, 1, uint64(t + 1), "SG"), allowOnly, t)), uint8(RuleV2Lib.Reason.None)
        );

        RuleV2Lib.Rule memory grp = _rule(0, 0, new bytes2[](0), true);
        grp.group = bytes2("ZZ");
        assertEq(
            uint8(RuleV2Lib.evaluate(_holder(40, 1, uint64(t + 1), "SG"), grp, t)),
            uint8(RuleV2Lib.Reason.GroupMismatch)
        );

        RuleV2Lib.Rule memory inactive = _rule(0, 0, new bytes2[](0), true);
        inactive.active = false;
        assertEq(
            uint8(RuleV2Lib.evaluate(_holder(40, 1, uint64(t + 1), "SG"), inactive, t)),
            uint8(RuleV2Lib.Reason.PolicyInactive)
        );
    }

    /// Expiry uses < now (a credential valid through second T is refused only after T passes) —
    /// Monad timestamps can repeat across consecutive blocks, so boundary semantics matter.
    function test_expiryBoundary() public view {
        RuleV2Lib.Rule memory r = _rule(0, 0, new bytes2[](0), true);
        uint256 t = block.timestamp;
        assertEq(uint8(RuleV2Lib.evaluate(_holder(40, 1, uint64(t), "SG"), r, t)), uint8(RuleV2Lib.Reason.None));
        assertEq(
            uint8(RuleV2Lib.evaluate(_holder(40, 1, uint64(t - 1), "SG"), r, t)),
            uint8(RuleV2Lib.Reason.CredentialExpired)
        );
    }
}

contract VerifiedAssetTokenTest is Base {
    function setUp() public override {
        super.setUp();
        vm.prank(admin);
        note.mint(alice, 1_000e6);
    }

    function test_transferBetweenEligibleHolders() public {
        vm.prank(alice);
        note.transfer(bob, 100e6);
        assertEq(note.balanceOf(bob), 100e6);
    }

    function test_transferToUnregisteredReverts() public {
        address stranger = makeAddr("stranger");
        vm.expectRevert(
            abi.encodeWithSelector(
                VerifiedAssetToken.TransferIneligible.selector, stranger, RuleV2Lib.Reason.NotRegistered
            )
        );
        vm.prank(alice);
        note.transfer(stranger, 1e6);
    }

    /// THE ACT-2 PROOF BEAT: the same transfer passes under v1 and reverts under v2.
    function test_policyEnactmentFlipsLiveTransfer() public {
        vm.prank(alice);
        note.transfer(carol, 100e6); // v1: KP holder fine

        vm.startPrank(admin);
        _anchorAndEnact(_rule(10, 0, _countries(bytes2("KP")), true), "v2: blacklist KP");
        vm.stopPrank();

        vm.expectRevert(
            abi.encodeWithSelector(
                VerifiedAssetToken.TransferIneligible.selector, carol, RuleV2Lib.Reason.IneligibleCountry
            )
        );
        vm.prank(alice);
        note.transfer(carol, 100e6);

        // and carol cannot exit to bob either — the from-leg is checked too
        vm.expectRevert(
            abi.encodeWithSelector(
                VerifiedAssetToken.TransferIneligible.selector, carol, RuleV2Lib.Reason.IneligibleCountry
            )
        );
        vm.prank(carol);
        note.transfer(bob, 1e6);
    }

    function test_freezeIsLiveNotLatched() public {
        vm.prank(admin);
        reg.setStatus(alice, 2);
        vm.expectRevert(
            abi.encodeWithSelector(
                VerifiedAssetToken.TransferIneligible.selector, alice, RuleV2Lib.Reason.CredentialFrozen
            )
        );
        vm.prank(alice);
        note.transfer(bob, 1e6);

        vm.prank(admin);
        reg.setStatus(alice, 1); // reactivate → immediately eligible again, no keeper lag
        vm.prank(alice);
        note.transfer(bob, 1e6);
        assertEq(note.balanceOf(bob), 1e6);
    }

    function test_expiryRefusesAutomatically() public {
        vm.warp(block.timestamp + 31 days); // all fixtures expire at +30d
        vm.expectRevert(
            abi.encodeWithSelector(
                VerifiedAssetToken.TransferIneligible.selector, alice, RuleV2Lib.Reason.CredentialExpired
            )
        );
        vm.prank(alice);
        note.transfer(bob, 1e6);
    }

    function test_tierRaiseStrandsLowTierHolder() public {
        vm.prank(alice);
        note.transfer(bob, 50e6);
        vm.startPrank(admin);
        _anchorAndEnact(_rule(30, 0, new bytes2[](0), true), "v3: minTier 30");
        vm.stopPrank();
        vm.expectRevert(
            abi.encodeWithSelector(VerifiedAssetToken.TransferIneligible.selector, bob, RuleV2Lib.Reason.TierTooLow)
        );
        vm.prank(bob);
        note.transfer(alice, 1e6); // bob (tier 20) frozen out by policy, from-leg
    }

    function test_mintRequiresIssuerRole() public {
        vm.expectRevert();
        vm.prank(alice);
        note.mint(alice, 1e6);
    }
}

contract EligibilityRegistryTest is Base {
    function test_identityBindingIsMonotonic() public {
        vm.startPrank(admin);
        vm.expectRevert(
            abi.encodeWithSelector(
                EligibilityRegistry.IdentityRebindForbidden.selector, alice, keccak256("alice"), keccak256("mallory")
            )
        );
        reg.attest(alice, keccak256("mallory"), 99, 0, "AB", "AB", "SG", 1, uint64(block.timestamp + 1 days));
        vm.stopPrank();
    }

    function test_freezePreservesIdentity() public {
        vm.prank(admin);
        reg.setStatus(alice, 2);
        RuleV2Lib.Holder memory h = reg.holderOf(alice);
        assertEq(h.cvRecordId, keccak256("alice")); // identity survives revocation
        assertEq(h.status, 2);
    }

    function test_attestRequiresKeeperRole() public {
        vm.expectRevert();
        vm.prank(alice);
        reg.attest(alice, keccak256("x"), 1, 0, "AB", "AB", "SG", 1, 1);
    }
}

contract PolicyRegistryTest is Base {
    function test_hashChainLinks() public {
        vm.startPrank(admin);
        bytes32 v2 = _anchorAndEnact(_rule(30, 0, new bytes2[](0), true), "v2");
        bytes32 v3 = _anchorAndEnact(_rule(40, 0, new bytes2[](0), true), "v3");
        vm.stopPrank();

        assertEq(pol.versionCount(ASSET), 3);
        PolicyRegistry.Version memory ver3 = pol.versionAt(ASSET, 2);
        assertEq(ver3.hash, v3);
        assertEq(ver3.parentHash, v2); // chain integrity
        assertEq(pol.versionAt(ASSET, 1).parentHash, pol.versionAt(ASSET, 0).hash);
    }

    function test_enactRequiresGovernor() public {
        RuleV2Lib.Rule memory rule = _rule(1, 0, new bytes2[](0), true);
        bytes32 proofHash = keccak256("proof");
        vm.prank(admin);
        pol.anchorProof(ASSET, rule, proofHash, 0, 0);
        vm.expectRevert();
        vm.prank(alice);
        pol.enact(ASSET, rule, "nope", proofHash);
    }

    function test_anchorRequiresGovernor() public {
        vm.expectRevert();
        vm.prank(alice);
        pol.anchorProof(ASSET, _rule(1, 0, new bytes2[](0), true), keccak256("proof"), 0, 0);
    }

    function test_enactWithoutProofReverts() public {
        bytes32 missing = keccak256("missing");
        vm.expectRevert(abi.encodeWithSelector(PolicyRegistry.ProofNotFound.selector, ASSET, missing));
        vm.prank(admin);
        pol.enact(ASSET, _rule(30, 0, new bytes2[](0), true), "v2", missing);
    }

    function test_proofMustMatchExactRule() public {
        RuleV2Lib.Rule memory proofedRule = _rule(30, 0, new bytes2[](0), true);
        RuleV2Lib.Rule memory otherRule = _rule(40, 0, new bytes2[](0), true);
        bytes32 proofHash = keccak256("proofed-30");
        vm.prank(admin);
        pol.anchorProof(ASSET, proofedRule, proofHash, 2, 50e6);

        vm.expectRevert(
            abi.encodeWithSelector(
                PolicyRegistry.ProofRuleMismatch.selector, pol.hashRule(proofedRule), pol.hashRule(otherRule)
            )
        );
        vm.prank(admin);
        pol.enact(ASSET, otherRule, "v2", proofHash);
    }

    function test_proofMustMatchCurrentLineage() public {
        RuleV2Lib.Rule memory v2Rule = _rule(30, 0, new bytes2[](0), true);
        RuleV2Lib.Rule memory staleRule = _rule(40, 0, new bytes2[](0), true);
        bytes32 v2Proof = keccak256("v2-proof");
        bytes32 staleProof = keccak256("stale-v3-proof");
        bytes32 v1Hash = pol.versionAt(ASSET, 0).hash;

        vm.startPrank(admin);
        pol.anchorProof(ASSET, v2Rule, v2Proof, 1, 10e6);
        pol.anchorProof(ASSET, staleRule, staleProof, 2, 20e6);
        pol.enact(ASSET, v2Rule, "v2", v2Proof);
        vm.expectRevert(
            abi.encodeWithSelector(PolicyRegistry.ProofLineageMismatch.selector, v1Hash, pol.versionAt(ASSET, 1).hash)
        );
        pol.enact(ASSET, staleRule, "v3", staleProof);
        vm.stopPrank();
    }

    function test_proofCannotBeReused() public {
        RuleV2Lib.Rule memory rule = _rule(30, 0, new bytes2[](0), true);
        bytes32 proofHash = keccak256("single-use-proof");
        vm.startPrank(admin);
        pol.anchorProof(ASSET, rule, proofHash, 1, 10e6);
        pol.enact(ASSET, rule, "v2", proofHash);
        vm.expectRevert(abi.encodeWithSelector(PolicyRegistry.ProofAlreadyConsumed.selector, ASSET, proofHash));
        pol.enact(ASSET, rule, "v3", proofHash);
        vm.stopPrank();
    }

    function test_publicProofViewsExposeImpactAndLineage() public {
        RuleV2Lib.Rule memory rule = _rule(30, 0, new bytes2[](0), true);
        bytes32 proofHash = keccak256("public-proof");
        vm.startPrank(admin);
        pol.anchorProof(ASSET, rule, proofHash, 7, 123e6);
        bytes32 versionHash = pol.enact(ASSET, rule, "v2", proofHash);
        vm.stopPrank();

        IPreEnactmentProof.ProofRecord memory proof = pol.activeProof(ASSET);
        assertEq(proof.proofHash, proofHash);
        assertEq(proof.versionHash, versionHash);
        assertEq(proof.parentHash, pol.versionAt(ASSET, 0).hash);
        assertEq(proof.affectedHolderCount, 7);
        assertEq(proof.strandedValue, 123e6);
        assertTrue(proof.consumed);
        assertEq(pol.proofAt(ASSET, 1).proofHash, proofHash);
        assertEq(pol.proofByHash(ASSET, proofHash).versionHash, versionHash);
        assertEq(pol.versionAt(ASSET, 1).proofHash, proofHash);
    }

    function test_supportsPublicProofInterface() public view {
        assertTrue(pol.supportsInterface(type(IPreEnactmentProof).interfaceId));
    }

    function test_noActivePolicyReverts() public {
        vm.expectRevert(abi.encodeWithSelector(PolicyRegistry.NoActivePolicy.selector, keccak256("other")));
        pol.activeRule(keccak256("other"));
    }
}

contract DistributionEngineTest is Base {
    uint128 constant A = 400e6;
    uint128 constant B = 250e6;
    uint128 constant C = 350e6;

    function _fundAndCreate() internal returns (uint256 runId) {
        vm.startPrank(admin);
        cash.mint(admin, 1_000e6);
        cash.approve(address(engine), 1_000e6);
        address[] memory holders = new address[](3);
        holders[0] = alice;
        holders[1] = bob;
        holders[2] = carol;
        uint128[] memory amounts = new uint128[](3);
        amounts[0] = A;
        amounts[1] = B;
        amounts[2] = C;
        runId = engine.createRun(ASSET, cash, holders, amounts, "Q3 coupon");
        vm.stopPrank();
    }

    function test_allEligible_allPaid() public {
        uint256 runId = _fundAndCreate();
        vm.prank(admin);
        engine.payLegs(runId, 0, 3);
        assertEq(cash.balanceOf(alice), A);
        assertEq(cash.balanceOf(carol), C);
        (,,,, uint128 escrowed,, uint32 paid,,) = engine.runs(runId);
        assertEq(escrowed, 0);
        assertEq(paid, 3);
    }

    /// THE ACT-2 ESCROW BEAT: policy changes between funding and pay-time; the stranded
    /// leg suspends with the exact reason, then releases after remediation.
    function test_suspendThenRelease() public {
        uint256 runId = _fundAndCreate();

        vm.startPrank(admin);
        _anchorAndEnact(_rule(10, 0, _countries(bytes2("KP")), true), "v2: blacklist KP");
        vm.stopPrank();

        vm.prank(admin);
        engine.payLegs(runId, 0, 3);

        assertEq(cash.balanceOf(alice), A); // eligible legs paid immediately
        assertEq(cash.balanceOf(carol), 0); // stranded leg caught, not lost

        DistributionEngine.Leg memory leg = engine.legAt(runId, 2);
        assertEq(uint8(leg.state), uint8(DistributionEngine.LegState.Suspended));
        assertEq(uint8(leg.reason), uint8(RuleV2Lib.Reason.IneligibleCountry));
        (,,,, uint128 escrowed,,,,) = engine.runs(runId);
        assertEq(escrowed, C); // escrow invariant: sum(escrowed) == sum(suspended legs)

        // Still ineligible → release refused with reason.
        vm.expectRevert(
            abi.encodeWithSelector(
                DistributionEngine.StillIneligible.selector, runId, 2, RuleV2Lib.Reason.IneligibleCountry
            )
        );
        engine.releaseLeg(runId, 2);

        // Remediation: carol re-verifies out of the blacklisted jurisdiction (policy op).
        vm.prank(admin);
        reg.attest(carol, keccak256("carol"), 60, 0, "AB", "AB", "SG", 1, uint64(block.timestamp + 30 days));

        engine.releaseLeg(runId, 2); // permissionless — eligibility re-proven on-chain
        assertEq(cash.balanceOf(carol), C);
        (,,,, uint128 escrowedAfter,, uint32 paidAfter,,) = engine.runs(runId);
        assertEq(escrowedAfter, 0);
        assertEq(paidAfter, 3);
    }

    function test_frozenHolderSuspends() public {
        uint256 runId = _fundAndCreate();
        vm.startPrank(admin);
        reg.setStatus(bob, 2);
        engine.payLegs(runId, 0, 3);
        vm.stopPrank();
        DistributionEngine.Leg memory leg = engine.legAt(runId, 1);
        assertEq(uint8(leg.state), uint8(DistributionEngine.LegState.Suspended));
        assertEq(uint8(leg.reason), uint8(RuleV2Lib.Reason.CredentialFrozen));
    }

    function test_paginationAndIdempotence() public {
        uint256 runId = _fundAndCreate();
        vm.startPrank(admin);
        engine.payLegs(runId, 0, 2);
        engine.payLegs(runId, 0, 3); // overlapping page: already-paid legs are skipped
        vm.stopPrank();
        assertEq(cash.balanceOf(alice), A);
        assertEq(cash.balanceOf(bob), B);
        assertEq(cash.balanceOf(carol), C);
        assertEq(cash.balanceOf(address(engine)), 0);
    }

    function test_createRequiresFunding() public {
        vm.startPrank(admin);
        address[] memory holders = new address[](1);
        holders[0] = alice;
        uint128[] memory amounts = new uint128[](1);
        amounts[0] = 1e6;
        vm.expectRevert(); // no approve → safeTransferFrom fails, run cannot exist unfunded
        engine.createRun(ASSET, cash, holders, amounts, "unfunded");
        vm.stopPrank();
    }

    function test_payRequiresOperator() public {
        uint256 runId = _fundAndCreate();
        vm.expectRevert();
        vm.prank(alice);
        engine.payLegs(runId, 0, 3);
    }
}
