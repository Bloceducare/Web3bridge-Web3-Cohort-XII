// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20("TOKEN", "TKN") {
    constructor(uint256 initialSupply) {
        _mint(msg.sender, initialSupply);
    }
}
