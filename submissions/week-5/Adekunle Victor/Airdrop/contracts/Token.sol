// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DripToken is ERC20 {
    constructor() ERC20("DripToken", "Drp") {
        _mint(msg.sender, 1000000 * 10**18); // Mint 1M tokens to deployer
    }
}
