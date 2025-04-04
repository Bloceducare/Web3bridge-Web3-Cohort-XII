// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./IEbubeToken.sol";

contract EbubeToken is ERC20, IEbubeToken {
    constructor(uint256 initialSupply) ERC20("Ebube", "EBUBE") {
        _mint(msg.sender, initialSupply);
    }

    function mint(address to, uint256 amount) external override {
        _mint(to, amount);
    }
}
