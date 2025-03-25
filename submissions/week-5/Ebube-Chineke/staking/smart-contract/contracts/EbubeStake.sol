// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./IEbubeToken.sol";

contract EbubeStake is ReentrancyGuard {
    IEbubeToken public ebubeToken;
    address public ebubeTokenAddress;

    struct Stake {
        uint256 amount;
        uint256 startTime;
        bool active;
    }

    mapping(address => Stake) public stakes;
    uint256 public MIN_STAKE_TIME_IN_DAYS;
    uint256 public REWARD_RATE ;

    event Staked(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 amount, uint256 reward, uint256 timestamp);

    constructor(address _ebubeToken, uint256 _minimumStakeInDays, uint256 _rewardRate) {
        require(_ebubeToken != address(0), "Invalid token address");
        ebubeTokenAddress = _ebubeToken;
        ebubeToken = IEbubeToken(_ebubeToken);
        REWARD_RATE = _rewardRate;
        MIN_STAKE_TIME_IN_DAYS = _minimumStakeInDays;
    }

    function stake(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Stake amount must be greater than zero");
        require(stakes[msg.sender].amount == 0, "Already staked");

        ebubeToken.transferFrom(msg.sender, address(this), _amount);
        stakes[msg.sender] = Stake({
            amount: _amount,
            startTime: block.timestamp,
            active: true
        });

        emit Staked(msg.sender, _amount, block.timestamp);
    }

    function withdraw() external nonReentrant {
        Stake storage userStake = stakes[msg.sender];
        require(userStake.active, "No active stake");
        require(block.timestamp >= userStake.startTime + (MIN_STAKE_TIME_IN_DAYS * 60 * 60 * 24), "Staking period not met");

        uint256 reward = calculateReward(msg.sender);
        uint256 totalAmount = userStake.amount + reward;

        userStake.active = false;
        userStake.amount = 0;

        ebubeToken.transfer(msg.sender, totalAmount);
        emit Withdrawn(msg.sender, userStake.amount, reward, block.timestamp);
    }

    function calculateReward(address _staker) public view returns (uint256) {
        Stake storage userStake = stakes[_staker];
        if (!userStake.active) return 0;

        uint256 stakingDuration = block.timestamp - userStake.startTime;
        uint256 yearlyReward = (userStake.amount * REWARD_RATE) / 100;
        uint256 reward = (yearlyReward * stakingDuration) / 365 * 24 * 60 * 60; // 31,536,000 seconds in a year

        return reward;
    }

    function getStakedAmount(address _staker) external view returns (uint256) {
        return stakes[_staker].amount;
    }

    function getStakeStartTime(address _staker) external view returns (uint256) {
        return stakes[_staker].startTime;
    }
}
