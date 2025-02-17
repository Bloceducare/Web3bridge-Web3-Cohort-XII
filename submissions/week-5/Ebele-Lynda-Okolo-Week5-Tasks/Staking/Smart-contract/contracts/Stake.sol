// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./IStake.sol";

contract StakeContract is IStake, ReentrancyGuard {
    IERC20 public immutable stakingToken;
    uint256 public constant MINIMUM_STAKING_DURATION = 7 days; 
    uint256 public constant REWARD_RATE = 10; // 10% annual reward

    struct Stake {
        uint256 amount;
        uint256 startTime;
        bool withdrawn;
    }

    mapping(address => Stake) public stakes;

    // Custom errors
    error AlreadyStaked();
    error InsufficientStake();
    error StakingPeriodNotReached();
    error NoRewardsEarned();

    event Staked(address indexed user, uint256 amount, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 amount, uint256 reward, uint256 timestamp);

    constructor(IERC20 _stakingToken) {
        stakingToken = _stakingToken;
    }

    function stake(uint256 _amount) external override nonReentrant {
        if (stakes[msg.sender].amount > 0) revert AlreadyStaked();
        if (_amount == 0) revert InsufficientStake();

        stakes[msg.sender] = Stake(_amount, block.timestamp, false);
        stakingToken.transferFrom(msg.sender, address(this), _amount);

        emit Staked(msg.sender, _amount, block.timestamp);
    }

    function calculateReward(address _user) public view override returns (uint256) {
        Stake storage userStake = stakes[_user];

        if (userStake.amount == 0 || userStake.withdrawn) revert NoRewardsEarned();

        uint256 duration = block.timestamp - userStake.startTime;
        uint256 reward = (userStake.amount * REWARD_RATE * duration) / (100 * 365 days); // Annualized reward

        return reward;
    }

    function withdraw() external override nonReentrant {
        Stake storage userStake = stakes[msg.sender];

        if (userStake.amount == 0) revert InsufficientStake();
        if (block.timestamp - userStake.startTime < MINIMUM_STAKING_DURATION) revert StakingPeriodNotReached();
        if (userStake.withdrawn) revert NoRewardsEarned();

        uint256 reward = calculateReward(msg.sender);
        uint256 totalAmount = userStake.amount + reward;

        userStake.withdrawn = true;
        stakingToken.transfer(msg.sender, totalAmount);

        emit Withdrawn(msg.sender, userStake.amount, reward, block.timestamp);
    }
}
