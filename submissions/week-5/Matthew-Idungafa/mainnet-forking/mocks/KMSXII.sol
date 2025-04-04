// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import openzeppelin-solidity/contracts/token/ERC20/IERC20.sol;

contract KMS is ERC20("TestToken", "KMS22") {
    address public owner; 

    constructor() {
        ownner = msg.sender; 
        _mint(msg.sender, 1000000000000000000000000);
    }

    function mint(uint _amount, address _reciever) external {
        require(msg.sender == owner, "You are not the owner");
        _mint(_reciever, _amount * 1e18);
    }
}