// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract ERC20Token is ERC20 {
    address public owner;
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        owner = msg.sender;
        _mint(owner, initialSupply);
    }

    function mint(address to, uint256 amount) public {
        if (msg.sender != owner) {
            revert("Only owner can mint");
        }
        transferFrom(owner, to, amount);
    }
  
}
