// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract TokenB is ERC20, ERC20Permit, Ownable {
    constructor(address recipient, address initialOwner)
        ERC20("TokenB", "TKB")
        ERC20Permit("TokenB")
        Ownable(initialOwner)
    {
        _mint(recipient, 10000 * 10 ** decimals());
    }
}
