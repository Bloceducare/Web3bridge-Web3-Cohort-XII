// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Custom errors for gas efficiency
error Staking__InsufficientBalance();
error Staking__InvalidAmount();
error Staking__NotEnoughStakeTime();
error Staking__InsufficientRewardBalance();
error Staking__ReentrancyAttempt();

contract Staking is Ownable {
    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardToken;
    
    // Staking parameters
    uint256 public constant MIN_STAKING_PERIOD = 7 days;
    uint256 public constant REWARD_RATE = 100; // 100 basis points (1%) per year
    
    // Reentrancy protection
    bool private _locked;
    
    struct StakeInfo {
        uint256 amount;
        uint256 timestamp;
        uint256 lastRewardCalculation;
        uint256 accumulatedRewards; // Added to track accumulated rewards
    }
    
    mapping(address => StakeInfo) public stakes;
    uint256 public totalStaked;
    
    // Events
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount, uint256 reward);
    event RewardsAdded(uint256 amount);
    
    modifier nonReentrant() {
        if (_locked) revert Staking__ReentrancyAttempt();
        _locked = true;
        _;
        _locked = false;
    }
    
    constructor(address _stakingToken, address _rewardToken, address initialOwner) 
        Ownable(initialOwner) 
    {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
    }
    
    function stake(uint256 _amount) external nonReentrant {
        if (_amount == 0) revert Staking__InvalidAmount();
        
        // Track staked amount and duration first (effects)
        StakeInfo storage userStake = stakes[msg.sender];
        if (userStake.amount > 0) {
            // Calculate and accumulate pending rewards
            uint256 pendingReward = calculateReward(msg.sender);
            userStake.accumulatedRewards += pendingReward;
            userStake.amount += _amount;
            userStake.lastRewardCalculation = block.timestamp;
        } else {
            userStake.amount = _amount;
            userStake.timestamp = block.timestamp;
            userStake.lastRewardCalculation = block.timestamp;
        }
        
        totalStaked += _amount;
        
        // Transfer staking tokens (interactions)
        if (!stakingToken.transferFrom(msg.sender, address(this), _amount)) {
            revert Staking__InsufficientBalance();
        }
        
        emit Staked(msg.sender, _amount);
    }
    
    function withdraw() external nonReentrant {
        StakeInfo storage userStake = stakes[msg.sender];
        if (userStake.amount == 0) revert Staking__InvalidAmount();
        
        if (block.timestamp < userStake.timestamp + MIN_STAKING_PERIOD) {
            revert Staking__NotEnoughStakeTime();
        }
        
        uint256 reward = calculateReward(msg.sender) + userStake.accumulatedRewards;
        uint256 stakeAmount = userStake.amount;
        
        // Check reward balance
        if (rewardToken.balanceOf(address(this)) < reward) {
            revert Staking__InsufficientRewardBalance();
        }
        
        // Effects: Update state before transfers
        totalStaked -= userStake.amount;
        userStake.amount = 0;
        userStake.timestamp = 0;
        userStake.lastRewardCalculation = 0;
        userStake.accumulatedRewards = 0;
        
        // Interactions: Transfer tokens
        if (!stakingToken.transfer(msg.sender, stakeAmount)) {
            revert Staking__InsufficientBalance();
        }
        
        if (!rewardToken.transfer(msg.sender, reward)) {
            revert Staking__InsufficientBalance();
        }
        
        emit Withdrawn(msg.sender, stakeAmount, reward);
    }
    
    function calculateReward(address _user) public view returns (uint256) {
        StakeInfo memory userStake = stakes[_user];
        if (userStake.amount == 0) return 0;
        
        uint256 stakingDuration = block.timestamp - userStake.lastRewardCalculation;
        uint256 annualReward = (userStake.amount * REWARD_RATE) / 10000;
        uint256 reward = (annualReward * stakingDuration) / 365 days;
        
        return reward;
    }
    
    function addRewards(uint256 _amount) external onlyOwner nonReentrant {
        if (!rewardToken.transferFrom(msg.sender, address(this), _amount)) {
            revert Staking__InsufficientBalance();
        }
        emit RewardsAdded(_amount);
    }
    
    function getStakeInfo(address _user) external view returns (StakeInfo memory) {
        return stakes[_user];
    }
    
    function emergencyWithdrawRewardTokens(uint256 _amount) external onlyOwner nonReentrant {
        if (!rewardToken.transfer(msg.sender, _amount)) {
            revert Staking__InsufficientBalance();
        }
    }
    
    function emergencyWithdrawStakeTokens(uint256 _amount) external onlyOwner nonReentrant {
        if (_amount > stakingToken.balanceOf(address(this)) - totalStaked) {
            revert Staking__InvalidAmount();
        }
        if (!stakingToken.transfer(msg.sender, _amount)) {
            revert Staking__InsufficientBalance();
        }
    }
}