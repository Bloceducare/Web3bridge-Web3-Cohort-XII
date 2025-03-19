// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    constructor(address recipient, address initialOwner)
        ERC20(_name, "_symbol")
        Ownable(initialOwner)
    {
        _mint(recipient, 100000 * 10 ** decimals());
    }
        _mint(msg.sender, amount);
    
}