// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract LagCoin is ERC20, Ownable {
    constructor(address initialOwner)
        ERC20("LagCoin", "LGC")
    {
        transferOwnership(initialOwner); // Transfer ownership to the initial owner
    }

    // Mint function, restricted to the owner
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // You can also define any additional functions specific to your token here, 
    // but no overrides for ERC20Votes or ERC20Permit.
}
