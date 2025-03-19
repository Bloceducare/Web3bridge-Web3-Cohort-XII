// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenX is ERC20 {
    constructor() ERC20("TokenX", "TKX") {
        _mint(msg.sender, 10_000 * 10**decimals()); // 10,000 TX tokens
    }
}

