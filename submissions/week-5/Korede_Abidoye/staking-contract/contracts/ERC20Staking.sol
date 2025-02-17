// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract ERC20Staking is ReentrancyGuard, Ownable {
    using SafeMath for uint256;

    IERC20 public stakingToken;
    IERC20 public rewardToken;
    uint256 public rewardRate = 1e18; // 1 token per second
    uint256 public minimumStakingDuration = 7 days;
    
    // Enhanced stake tracking structure
    struct Stake {
        uint256 amount;
        uint256 timestamp;
        bool active;
    }
    
    struct UserInfo {
        Stake[] stakes;              // Array of all stakes for the user
        uint256 totalStakedAmount;   // Total amount staked by user
        uint256 lastRewardCalculationTime;
        uint256 unclaimedRewards;
    }
    
    // Mapping of user address to their staking information
    mapping(address => UserInfo) public userInfo;
    
    // Total staked amount across all users
    uint256 public totalStaked;
    
    // Events
    event StakeCreated(address indexed user, uint256 stakeId, uint256 amount, uint256 timestamp);
    event StakeWithdrawn(address indexed user, uint256 stakeId, uint256 amount, uint256 duration);
    event RewardClaimed(address indexed user, uint256 reward);
    event RewardRateUpdated(uint256 newRate);
    
    constructor(address _stakingToken, address _rewardToken) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
    }
    
    // Function to stake tokens
    function stake(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Cannot stake 0 tokens");
        
        // Calculate pending rewards before adding new stake
        _calculateAndUpdateReward(msg.sender);
        
        // Transfer tokens from user to contract
        require(stakingToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        // Create new stake
        UserInfo storage user = userInfo[msg.sender];
        uint256 stakeId = user.stakes.length;
        
        user.stakes.push(Stake({
            amount: _amount,
            timestamp: block.timestamp,
            active: true
        }));
        
        // Update user's total staked amount
        user.totalStakedAmount = user.totalStakedAmount.add(_amount);
        totalStaked = totalStaked.add(_amount);
        
        emit StakeCreated(msg.sender, stakeId, _amount, block.timestamp);
    }
    
    // Function to withdraw a specific stake
    function withdrawStake(uint256 _stakeId) external nonReentrant {
        UserInfo storage user = userInfo[msg.sender];
        require(_stakeId < user.stakes.length, "Invalid stake ID");
        
        Stake storage userStake = user.stakes[_stakeId];
        require(userStake.active, "Stake already withdrawn");
        require(userStake.amount > 0, "No stake amount");
        
        uint256 stakingDuration = block.timestamp.sub(userStake.timestamp);
        require(stakingDuration >= minimumStakingDuration, "Staking duration not met");
        
        // Calculate rewards before withdrawal
        _calculateAndUpdateReward(msg.sender);
        
        uint256 withdrawAmount = userStake.amount;
        
        // Update state
        userStake.active = false;
        user.totalStakedAmount = user.totalStakedAmount.sub(withdrawAmount);
        totalStaked = totalStaked.sub(withdrawAmount);
        
        // Transfer tokens back to user
        require(stakingToken.transfer(msg.sender, withdrawAmount), "Transfer failed");
        
        emit StakeWithdrawn(msg.sender, _stakeId, withdrawAmount, stakingDuration);
    }
    
    // Function to get all active stakes for a user
    function getUserStakes(address _user) external view returns (
        uint256[] memory amounts,
        uint256[] memory timestamps,
        bool[] memory activeStatus
    ) {
        UserInfo storage user = userInfo[_user];
        uint256 stakeCount = user.stakes.length;
        
        amounts = new uint256[](stakeCount);
        timestamps = new uint256[](stakeCount);
        activeStatus = new bool[](stakeCount);
        
        for (uint256 i = 0; i < stakeCount; i++) {
            Stake storage stake = user.stakes[i];
            amounts[i] = stake.amount;
            timestamps[i] = stake.timestamp;
            activeStatus[i] = stake.active;
        }
        
        return (amounts, timestamps, activeStatus);
    }
    
    // Function to get stake duration for a specific stake
    function getStakeDuration(address _user, uint256 _stakeId) external view returns (uint256) {
        require(_stakeId < userInfo[_user].stakes.length, "Invalid stake ID");
        Stake storage stake = userInfo[_user].stakes[_stakeId];
        return block.timestamp.sub(stake.timestamp);
    }
    
    // Function to claim rewards
    function claimRewards() external nonReentrant {
        _calculateAndUpdateReward(msg.sender);
        
        uint256 reward = userInfo[msg.sender].unclaimedRewards;
        require(reward > 0, "No rewards to claim");
        
        userInfo[msg.sender].unclaimedRewards = 0;
        require(rewardToken.transfer(msg.sender, reward), "Reward transfer failed");
        
        emit RewardClaimed(msg.sender, reward);
    }
    
    // Internal function to calculate and update rewards
    function _calculateAndUpdateReward(address _user) internal {
        UserInfo storage user = userInfo[_user];
        
        if (user.totalStakedAmount > 0) {
            uint256 timeElapsed = block.timestamp.sub(user.lastRewardCalculationTime);
            uint256 reward = timeElapsed
                .mul(rewardRate)
                .mul(user.totalStakedAmount)
                .div(1e18);
            
            user.unclaimedRewards = user.unclaimedRewards.add(reward);
        }
        
        user.lastRewardCalculationTime = block.timestamp;
    }
    
    // Function to view pending rewards
    function getPendingRewards(address _user) external view returns (uint256) {
        UserInfo storage user = userInfo[_user];
        
        uint256 pendingReward = user.unclaimedRewards;
        
        if (user.totalStakedAmount > 0) {
            uint256 timeElapsed = block.timestamp.sub(user.lastRewardCalculationTime);
            pendingReward = pendingReward.add(
                timeElapsed
                    .mul(rewardRate)
                    .mul(user.totalStakedAmount)
                    .div(1e18)
            );
        }
        
        return pendingReward;
    }
    
    // Admin function to update reward rate
    function setRewardRate(uint256 _newRate) external onlyOwner {
        rewardRate = _newRate;
        emit RewardRateUpdated(_newRate);
    }
    
    // Admin function to update minimum staking duration
    function setMinimumStakingDuration(uint256 _duration) external onlyOwner {
        minimumStakingDuration = _duration;
    }
}