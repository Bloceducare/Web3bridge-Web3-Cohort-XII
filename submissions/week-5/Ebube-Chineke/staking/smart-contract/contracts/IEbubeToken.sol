// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // Import the OpenZeppelin ERC20 interface

interface IEbubeToken is IERC20 {
    // You can add additional functions here if your specific ERC20 token needs custom functionality
    // For example, a function to mint tokens:
    function mint(address to, uint256 amount) external; 
}