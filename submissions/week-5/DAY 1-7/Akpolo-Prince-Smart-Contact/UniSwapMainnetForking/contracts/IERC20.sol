// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface IERC20{
    function approve(address _spender, uint _value) external;
    function balanceOf(address who) external view returns(uint256 balance);
}