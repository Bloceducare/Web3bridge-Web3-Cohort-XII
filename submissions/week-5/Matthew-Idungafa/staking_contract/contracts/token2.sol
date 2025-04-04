// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestRewardToken is ERC20 {
    constructor() ERC20("Test Reward Token", "TRWT") {
        // Mint 1000 tokens to deployer
        _mint(msg.sender, 1000 * 10**18);
    }
}