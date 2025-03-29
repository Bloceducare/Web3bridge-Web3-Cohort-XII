// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenY is ERC20("FabimWorld", "FBW") {
  constructor(uint256 initialSupply) {
    _mint(msg.sender, initialSupply);
  }
}