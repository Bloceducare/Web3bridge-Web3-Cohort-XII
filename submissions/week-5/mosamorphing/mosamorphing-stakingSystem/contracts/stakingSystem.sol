// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract StakingSystem is ReentrancyGuard {
    IERC20 public stakingToken;

    uint256 public constant REWARD_RATE = 10; // 10% annual reward rate
    uint256 public constant MIN_STAKING_DURATION = 30 days;

    struct Stake {
        uint256 amount;
        uint256 stakingStartTime;
    }

    mapping(address => Stake) public stakes;

    event Staked(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 amount, uint256 reward, uint256 timestamp);

    constructor(address _stakingToken) {
        stakingToken = IERC20(_stakingToken);
    }

    function stake(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");

        // Transfer tokens from the user to the contract
        require(stakingToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        // Update the user's stake
        stakes[msg.sender] = Stake({
            amount: _amount,
            stakingStartTime: block.timestamp
        });

        emit Staked(msg.sender, _amount, block.timestamp);
    }

    function calculateReward(address _user) public view returns (uint256) {
        Stake memory userStake = stakes[_user];
        if (userStake.amount == 0) return 0;

        uint256 stakingDuration = block.timestamp - userStake.stakingStartTime;
        uint256 reward = (userStake.amount * REWARD_RATE * stakingDuration) / (365 days * 100);

        return reward;
    }

    function withdraw() external nonReentrant {
        Stake memory userStake = stakes[msg.sender];
        require(userStake.amount > 0, "No stake found");

        uint256 stakingDuration = block.timestamp - userStake.stakingStartTime;
        require(stakingDuration >= MIN_STAKING_DURATION, "Staking duration not met");

        uint256 reward = calculateReward(msg.sender);
        uint256 totalAmount = userStake.amount + reward;

        // Reset the user's stake
        delete stakes[msg.sender];

        // Transfer staked tokens and rewards back to the user
        require(stakingToken.transfer(msg.sender, totalAmount), "Transfer failed");

        emit Withdrawn(msg.sender, userStake.amount, reward, block.timestamp);
    }

    function getStakeInfo(address _user) external view returns (uint256 amount, uint256 stakingStartTime) {
        Stake memory userStake = stakes[_user];
        return (userStake.amount, userStake.stakingStartTime);
    }
}