// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

error Staking__ZeroAmount();
error Staking__InsufficientStake();
error Staking__MinimumStakePeriodNotMet();
error Staking__TransferFailed();
error Staking__InsufficientRewardBalance();

contract Staking is Ownable, ReentrancyGuard {
    IERC20 public immutable stakingToken;
    uint256 public constant REWARD_RATE = 1; // 1% reward per day
    uint256 public constant MIN_STAKE_PERIOD = 1 days;

    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        uint256 lastClaimTime;
    }

    mapping(address => StakeInfo) public stakes;
    mapping(address => uint256) public rewards;

    event Staked(address indexed user, uint256 amount, uint256 timestamp);
    event Unstaked(address indexed user, uint256 amount, uint256 reward, uint256 timestamp);
    event RewardClaimed(address indexed user, uint256 reward, uint256 timestamp);

    constructor(address _stakingToken) Ownable(msg.sender) {
        if (_stakingToken == address(0)) revert Staking__ZeroAmount();
        stakingToken = IERC20(_stakingToken);
    }

    function stake(uint256 _amount) external nonReentrant {
        if (_amount == 0) revert Staking__ZeroAmount();
        _updateRewards(msg.sender);
        bool success = stakingToken.transferFrom(msg.sender, address(this), _amount);
        if (!success) revert Staking__TransferFailed();

        StakeInfo storage stakeInfo = stakes[msg.sender];
        if (stakeInfo.amount == 0) {
            stakeInfo.startTime = block.timestamp;
            stakeInfo.lastClaimTime = block.timestamp;
        }
        stakeInfo.amount += _amount;
        emit Staked(msg.sender, _amount, block.timestamp);
    }

    function unstake() external nonReentrant {
        StakeInfo storage stakeInfo = stakes[msg.sender];
        if (stakeInfo.amount == 0) revert Staking__InsufficientStake();
        if (block.timestamp < stakeInfo.startTime + MIN_STAKE_PERIOD) {
            revert Staking__MinimumStakePeriodNotMet();
        }
        _updateRewards(msg.sender);

        uint256 amount = stakeInfo.amount;
        uint256 reward = rewards[msg.sender];
        if (stakingToken.balanceOf(address(this)) < amount + reward) {
            revert Staking__InsufficientRewardBalance();
        }

        stakeInfo.amount = 0;
        stakeInfo.startTime = 0;
        stakeInfo.lastClaimTime = 0;
        rewards[msg.sender] = 0;

        bool success = stakingToken.transfer(msg.sender, amount + reward);
        if (!success) revert Staking__TransferFailed();
        emit Unstaked(msg.sender, amount, reward, block.timestamp);
    }

    function claimRewards() external nonReentrant {
        _updateRewards(msg.sender);
        uint256 reward = rewards[msg.sender];
        if (reward == 0) revert Staking__InsufficientStake();
        if (stakingToken.balanceOf(address(this)) < reward) {
            revert Staking__InsufficientRewardBalance();
        }

        rewards[msg.sender] = 0;
        bool success = stakingToken.transfer(msg.sender, reward);
        if (!success) revert Staking__TransferFailed();
        emit RewardClaimed(msg.sender, reward, block.timestamp);
    }

    function depositRewardTokens(uint256 _amount) external onlyOwner {
        if (_amount == 0) revert Staking__ZeroAmount();
        bool success = stakingToken.transferFrom(msg.sender, address(this), _amount);
        if (!success) revert Staking__TransferFailed();
    }

    function _updateRewards(address _user) internal {
        StakeInfo storage stakeInfo = stakes[_user];
        if (stakeInfo.amount == 0) return;

        uint256 stakingDuration = block.timestamp - stakeInfo.lastClaimTime;
        uint256 reward = (stakeInfo.amount * REWARD_RATE * stakingDuration) / (1 days * 100);
        rewards[_user] += reward;
        stakeInfo.lastClaimTime = block.timestamp;
    }

    function _calculatePendingRewards(address _user) internal view returns (uint256) {
        StakeInfo storage stakeInfo = stakes[_user];
        if (stakeInfo.amount == 0) return 0;

        uint256 stakingDuration = block.timestamp - stakeInfo.lastClaimTime;
        uint256 pendingReward = (stakeInfo.amount * REWARD_RATE * stakingDuration) / (1 days * 100);
        return rewards[_user] + pendingReward;
    }

    function getStakeInfo(address _user) external view returns (StakeInfo memory, uint256) {
        uint256 pendingRewards = _calculatePendingRewards(_user);
        return (stakes[_user], pendingRewards);
    }
}