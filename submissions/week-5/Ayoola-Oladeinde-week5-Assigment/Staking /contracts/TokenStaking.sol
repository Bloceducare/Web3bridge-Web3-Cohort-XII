// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenStaking is Ownable {
    IERC20 public stakingToken;
    uint256 public rewardRate; // Reward rate per second per token staked
    uint256 public minStakeTime; // Minimum staking period in seconds

    struct StakeInfo {
        uint256 amount; // Amount of tokens staked
        uint256 startTime; // Timestamp when staked
        uint256 rewardDebt; // Rewards already accounted for
    }

    mapping(address => StakeInfo) public stakes;

    event Staked(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 amount, uint256 reward);

    // ✅ FIX: Call Ownable constructor explicitly
    constructor(
        address _stakingToken,
        uint256 _rewardRate,
        uint256 _minStakeTime
    ) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
        rewardRate = _rewardRate;
        minStakeTime = _minStakeTime;
    }

    // Stake tokens
    function stake(uint256 _amount) external {
        require(_amount > 0, "Cannot stake 0 tokens");

        StakeInfo storage userStake = stakes[msg.sender];

        // Calculate pending rewards before updating stake
        if (userStake.amount > 0) {
            userStake.rewardDebt += calculateReward(msg.sender);
        }

        // Transfer tokens to contract
        stakingToken.transferFrom(msg.sender, address(this), _amount);

        // Update stake details
        userStake.amount += _amount;
        userStake.startTime = block.timestamp;

        emit Staked(msg.sender, _amount, block.timestamp);
    }

    // Withdraw stake + rewards
    function withdraw() external {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.amount > 0, "No active stake");
        require(
            block.timestamp >= userStake.startTime + minStakeTime,
            "Stake time not met"
        );

        // Calculate total rewards
        uint256 reward = calculateReward(msg.sender) + userStake.rewardDebt;

        uint256 stakedAmount = userStake.amount;

        // Reset stake info
        delete stakes[msg.sender];

        // Transfer staked tokens back to user
        stakingToken.transfer(msg.sender, stakedAmount);

        // Transfer rewards
        if (reward > 0) {
            stakingToken.transfer(msg.sender, reward);
        }

        emit Withdrawn(msg.sender, stakedAmount, reward);
    }

    // Calculate rewards based on staking duration
    function calculateReward(address _user) public view returns (uint256) {
        StakeInfo storage userStake = stakes[_user];
        if (userStake.amount == 0) return 0;

        uint256 stakingDuration = block.timestamp - userStake.startTime;
        return (userStake.amount * stakingDuration * rewardRate) / 1e18;
    }

    // Update reward rate (only owner)
    function setRewardRate(uint256 _newRate) external onlyOwner {
        rewardRate = _newRate;
    }

    // Update minimum staking time (only owner)
    function setMinStakeTime(uint256 _newMinTime) external onlyOwner {
        minStakeTime = _newMinTime;
    }
}
