// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {EligibilityRegistry} from "../src/EligibilityRegistry.sol";
import {PolicyRegistry} from "../src/PolicyRegistry.sol";
import {VerifiedAssetToken} from "../src/VerifiedAssetToken.sol";
import {DistributionEngine} from "../src/DistributionEngine.sol";
import {SettlementToken} from "../src/SettlementToken.sol";
import {RuleV2Lib} from "../src/lib/RuleV2Lib.sol";

/// Deploys the Meridian stack and enacts the v1 baseline policy.
/// Writes addresses to deployments/<chainid>.json for the server + docs.
contract Deploy is Script {
    bytes32 constant ASSET = keccak256("MERIDIAN-NOTE-1");

    function run() external {
        uint256 pk = vm.envUint("DEPLOYER_KEY");
        address admin = vm.addr(pk);
        vm.startBroadcast(pk);

        EligibilityRegistry registry = new EligibilityRegistry(admin);
        PolicyRegistry policy = new PolicyRegistry(admin);
        VerifiedAssetToken note =
            new VerifiedAssetToken("Meridian Series-1 Note", "mNOTE", ASSET, registry, policy, admin);
        SettlementToken cash = new SettlementToken(admin);
        DistributionEngine engine = new DistributionEngine(registry, policy, admin);
        note.grantRole(note.PROTOCOL_ROLE(), address(engine));

        // Baseline policy v1: minTier 10, no jurisdiction restriction.
        RuleV2Lib.Rule memory v1 = RuleV2Lib.Rule({
            group: bytes2(0),
            subGroup: bytes2(0),
            minTier: 10,
            minSubTier: 0,
            countries: new bytes2[](0),
            isBlackList: true,
            active: true
        });
        bytes32 baselineProof = keccak256(abi.encode("MERIDIAN_BASELINE_PROOF_V1", ASSET, policy.hashRule(v1)));
        policy.anchorProof(ASSET, v1, baselineProof, 0, 0);
        policy.enact(ASSET, v1, "v1: baseline - minTier 10, no jurisdiction restriction", baselineProof);

        vm.stopBroadcast();

        string memory json = string.concat(
            '{"chainId":',
            vm.toString(block.chainid),
            ',"registry":"',
            vm.toString(address(registry)),
            '","policy":"',
            vm.toString(address(policy)),
            '","note":"',
            vm.toString(address(note)),
            '","cash":"',
            vm.toString(address(cash)),
            '","engine":"',
            vm.toString(address(engine)),
            '","deployBlock":',
            vm.toString(block.number),
            "}"
        );
        vm.writeFile(string.concat("deployments/", vm.toString(block.chainid), ".json"), json);
        console2.log("deployed. registry=%s policy=%s", address(registry), address(policy));
        console2.log("note=%s cash=%s", address(note), address(cash));
        console2.log("engine=%s admin=%s", address(engine), admin);
    }
}
