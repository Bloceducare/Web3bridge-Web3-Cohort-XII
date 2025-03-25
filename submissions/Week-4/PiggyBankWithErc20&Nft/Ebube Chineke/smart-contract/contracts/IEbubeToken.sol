// pragma solidity ^0.8.26;
// interface IERC20 {
//     function totalSupply() external view returns (uint256);
//     function balanceOf(address account) external view returns (uint256);
//     function transfer(address recipient, uint256 amount) external returns (bool);
//     function allowance(address owner, address spender) external view returns (uint256);
//     function approve(address spender, uint256 amount) external returns (bool);
//     function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
// }

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // Import the OpenZeppelin ERC20 interface

interface IEbubeToken is IERC20 {
    // You can add additional functions here if your specific ERC20 token needs custom functionality
    // For example, a function to mint tokens:
    function mint(address to, uint256 amount) external; 
}