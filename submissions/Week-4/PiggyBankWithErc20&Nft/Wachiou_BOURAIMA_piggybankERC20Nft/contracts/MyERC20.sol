// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyERC20 is ERC20 {
    address public owner;
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        owner = msg.sender;
        mint(owner, initialSupply);
    }

    function mint(address to, uint256 amount) public {
        require(msg.sender == owner, "OLE OLE THIEF");
        _mint(to, amount);
    }
  
}