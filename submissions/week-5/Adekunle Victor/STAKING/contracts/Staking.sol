// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./DripToken.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract Staking {
    // Custom Errors
    error InvalidAmount(uint256 amount);
    error TransferFailed();
    error InsufficientBalance(uint256 available, uint256 required);
    error NoRewardsToClaim();

    IERC20 public immutable dripToken;
    uint256 public totalSupply;
    uint256 public rewardRatePerSecond = 1e16; // 0.01 DRP per second

    mapping(address => uint256) public stakedAmount;
    mapping(address => uint256) public userRewards;
    mapping(address => uint256) public stakedTimestamps;

    constructor(address _token) {
        dripToken = IERC20(_token);
    }

    function stake(uint256 amount) public {
        if (amount == 0) revert InvalidAmount(amount);

        // Update user's reward before staking more
        updateReward(msg.sender);

        bool success = dripToken.transferFrom(msg.sender, address(this), amount);
        if (!success) revert TransferFailed();

        stakedAmount[msg.sender] += amount;
        totalSupply += amount;
        stakedTimestamps[msg.sender] = block.timestamp; // Update staking time
    }

    function unstake(uint256 amount) public {
        if (amount == 0) revert InvalidAmount(amount);
        if (stakedAmount[msg.sender] < amount) revert InsufficientBalance(stakedAmount[msg.sender], amount);

        // Update reward before unstaking
        updateReward(msg.sender);

        stakedAmount[msg.sender] -= amount;
        totalSupply -= amount;

        bool success = dripToken.transfer(msg.sender, amount);
        if (!success) revert TransferFailed();
    }

    function claimRewards() public {
        updateReward(msg.sender);
        uint256 reward = userRewards[msg.sender];
        if (reward == 0) revert NoRewardsToClaim();

        userRewards[msg.sender] = 0; // Reset rewards

        bool success = dripToken.transfer(msg.sender, reward);
        if (!success) revert TransferFailed();
    }

    function updateReward(address user) internal {
        if (stakedAmount[user] > 0) { // this is going to check if the staked amount is greater than 0;
            uint256 timeStaked = block.timestamp - stakedTimestamps[user]; // total time staked
            uint256 reward = stakedAmount[user] * rewardRatePerSecond * timeStaked / 1e18; // Normalize decimals
            userRewards[user] += reward;
        }
        stakedTimestamps[user] = block.timestamp;
    }
}
