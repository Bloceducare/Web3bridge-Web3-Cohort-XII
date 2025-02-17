// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IStaking {
    function stake(uint256 _amount) external;
    function withdraw() external;
    function calculateReward(address _user) external view returns (uint256);
}
