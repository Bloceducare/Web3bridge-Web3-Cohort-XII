// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20("Fabim", "FBM") {
    constructor(uint256 initialSupply) {
        _mint(msg.sender, initialSupply);
    }
}
