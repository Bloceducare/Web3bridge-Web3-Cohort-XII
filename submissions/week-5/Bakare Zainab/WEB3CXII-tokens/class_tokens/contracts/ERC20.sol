// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    constructor(string memory _name, string memory _symbol)
        ERC20("_name", "_symbol")
        Ownable(msg.sender)
    {
        _mint(recipient, 100000 * 10 ** decimals());
    }

    function mint(msg.sender, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}