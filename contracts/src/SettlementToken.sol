// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {AccessControl} from "openzeppelin-contracts/contracts/access/AccessControl.sol";

/// @title SettlementToken — demo cash leg (6-decimal, aUSDC-shaped).
/// @notice Stands in for real aUSDC (0xaC0893567D43C3E7e6e35a72803df05416C1f20D on Monad
///         testnet), whose mint path runs through the Cleanverse Gateway deposit flow.
///         Labeled honestly as a demo asset everywhere it appears.
contract SettlementToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor(address admin) ERC20("Meridian Demo USD", "dUSD") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
}
