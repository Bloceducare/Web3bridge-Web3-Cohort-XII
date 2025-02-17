// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StakingSystem is ReentrancyGuard, Ownable {
    IERC20 public stakingToken;
    uint256 public rewardRatePerSecond = 1e16; // 0.01 tokens per second
    uint256 public minStakingPeriod = 7 days;

    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
    }

    mapping(address => StakeInfo) public stakers;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount, uint256 reward);
    event RewardRateUpdated(uint256 newRate);

    constructor(address _stakingToken) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
    }

    function stake(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Cannot stake zero tokens");
        require(stakingToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        StakeInfo storage stakeInfo = stakers[msg.sender];

        if (stakeInfo.amount > 0) {
            uint256 rewards = calculateRewards(msg.sender);
            stakeInfo.amount += rewards;
        }

        stakeInfo.amount += _amount;
        stakeInfo.startTime = block.timestamp;

        emit Staked(msg.sender, _amount);
    }

    function calculateRewards(address _user) public view returns (uint256) {
        StakeInfo storage stakeInfo = stakers[_user];
        if (stakeInfo.amount == 0) return 0;

        uint256 stakingDuration = block.timestamp - stakeInfo.startTime;
        return (stakingDuration * stakeInfo.amount * rewardRatePerSecond) / 1e18;
    }

    function withdraw() external nonReentrant {
        StakeInfo storage stakeInfo = stakers[msg.sender];
        require(stakeInfo.amount > 0, "No active stake");
        require(block.timestamp >= stakeInfo.startTime + minStakingPeriod, "Minimum staking period not reached");

        uint256 rewards = calculateRewards(msg.sender);
        uint256 totalAmount = stakeInfo.amount + rewards;

        stakeInfo.amount = 0;

        require(stakingToken.transfer(msg.sender, totalAmount), "Transfer failed");

        emit Withdrawn(msg.sender, stakeInfo.amount, rewards);
    }

    function updateRewardRate(uint256 _newRate) external onlyOwner {
        rewardRatePerSecond = _newRate;
        emit RewardRateUpdated(_newRate);
    }
}
