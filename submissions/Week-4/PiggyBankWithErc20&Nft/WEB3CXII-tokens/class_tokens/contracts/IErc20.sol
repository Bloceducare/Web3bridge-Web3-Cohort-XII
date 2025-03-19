// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    // Returns the total token supply
    function totalSupply() external view returns (uint256);

    // Returns the balance of a given account
    function balanceOf(address account) external view returns (uint256);

    // Transfers a specified amount of tokens to another address
    function transfer(address recipient, uint256 amount) external returns (bool);

    // Returns the remaining number of tokens that spender can spend on behalf of owner
    function allowance(address owner, address spender) external view returns (uint256);

    // Approves another address to spend a specified amount of tokens on behalf of msg.sender
    function approve(address spender, uint256 amount) external returns (bool);

    // Transfers tokens from one address to another, using allowance mechanism
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    // Event emitted when tokens are transferred
    event Transfer(address indexed from, address indexed to, uint256 value);

    // Event emitted when a new allowance is set
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
