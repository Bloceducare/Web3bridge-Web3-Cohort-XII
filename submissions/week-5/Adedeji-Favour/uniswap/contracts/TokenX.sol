// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenX is ERC20("Fayob", "FYB") {
  constructor(uint256 initialSupply) {
    _mint(msg.sender, initialSupply);
  }
}