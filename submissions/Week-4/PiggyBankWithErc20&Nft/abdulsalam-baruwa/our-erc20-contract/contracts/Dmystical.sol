// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Dmystical is ERC20 {
    uint public initialSupply = 1000e18;
    constructor() ERC20("Dmystical", "DMY") {
        _mint(msg.sender, initialSupply);
    }
}