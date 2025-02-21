// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


// Custom Errors 
// Stake States
// track staking
// 

contract Staking is ReentrancyGuard {
    IERC20 public stakingTokenAddress;
    uint256 public rewardRate;
    uint256 public minimumStakingPeriod;

    struct Stake {
        uint256 amount;
        uint256 startTime;
        bool isActive;
    }

    mapping(address => Stake) public stakes;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount, uint256 reward);

   
    error CannotStakeZeroAmount();
    error AlreadyStaking();
    error NoActiveStake();
    error MinimumStakingPeriodNotMet();

    constructor(
        IERC20 _stakingTokenAddress,
        uint256 _rewardRate,
        uint256 _minimumStakingPeriod
    ) {
        stakingTokenAddress = _stakingTokenAddress;
        rewardRate = _rewardRate;
        minimumStakingPeriod = _minimumStakingPeriod;
    }

    function stake(uint256 amount) external {
        if (amount == 0) revert CannotStakeZeroAmount();
        if (stakes[msg.sender].isActive) revert AlreadyStaking();

        stakingTokenAddress.transferFrom(msg.sender, address(this), amount);

        stakes[msg.sender] = Stake({
            amount: amount,
            startTime: block.timestamp,
            isActive: true
        });

        emit Staked(msg.sender, amount);
    }

    function withdraw() external nonReentrant {
        Stake storage userStake = stakes[msg.sender];
        if (!userStake.isActive) revert NoActiveStake();
        if (block.timestamp < userStake.startTime + minimumStakingPeriod)
            revert MinimumStakingPeriodNotMet();

        uint256 reward = calculateReward(msg.sender);
        uint256 totalAmount = userStake.amount + reward;

        userStake.isActive = false; 
        stakingTokenAddress.transfer(msg.sender, totalAmount);

        emit Withdrawn(msg.sender, userStake.amount, reward);
    }

    function calculateReward(address user) public view returns (uint256) {
        Stake storage userStake = stakes[user];
        if (!userStake.isActive) return 0;

        uint256 stakingDuration = block.timestamp - userStake.startTime;
        return (stakingDuration * rewardRate * userStake.amount) / 1e18;
    }
}
