// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


error TransferFailed();
error NeedsMoreThanZero();
error MinimumStakingPeriodNotMet();

contract Staking is ReentrancyGuard {
    IERC20 public s_stakingToken;
    IERC20 public s_rewardsToken;

    // Constants
    uint256 public constant REWARD_RATE = 100;
    uint256 public constant MINIMUM_STAKING_PERIOD = 1 days;
    uint256 public constant MAX_REWARD_RATE = 1000;

    // State variables
    uint256 public s_lastUpdateTime;
    uint256 public s_rewardPerTokenStored;
    uint256 private s_totalSupply;
    bool public emergencyStop;

    // Mappings
    mapping(address => uint256) public s_userRewardPerTokenPaid;
    mapping(address => uint256) public s_rewards;
    mapping(address => uint256) public s_balances;
    mapping(address => uint256) public stakingStart;

    // Events
    event Staked(address indexed user, uint256 indexed amount);
    event Withdrawn(address indexed user, uint256 indexed amount);
    event RewardsClaimed(address indexed user, uint256 indexed amount);
    event EmergencyWithdraw(address indexed user, uint256 indexed amount);

    constructor(address stakingToken, address rewardsToken) {
        require(REWARD_RATE <= MAX_REWARD_RATE, "Reward rate too high");
        s_stakingToken = IERC20(stakingToken);
        s_rewardsToken = IERC20(rewardsToken);
        s_lastUpdateTime = block.timestamp;
    }

    // Core functions
    function rewardPerToken() public view returns (uint256) {
        if (s_totalSupply == 0) {
            return s_rewardPerTokenStored;
        }
        return s_rewardPerTokenStored + 
            (((block.timestamp - s_lastUpdateTime) * REWARD_RATE * 1e18) / s_totalSupply);
    }

    function earned(address account) public view returns (uint256) {
        return ((s_balances[account] * 
            (rewardPerToken() - s_userRewardPerTokenPaid[account])) / 1e18) + 
            s_rewards[account];
    }

    function stake(uint256 amount) external 
        updateReward(msg.sender) 
        nonReentrant 
        moreThanZero(amount) 
    {
        s_totalSupply += amount;
        s_balances[msg.sender] += amount;
        stakingStart[msg.sender] = block.timestamp;
        
        emit Staked(msg.sender, amount);
        
        bool success = s_stakingToken.transferFrom(msg.sender, address(this), amount);
        if (!success) {
            revert TransferFailed();
        }
    }

    function withdraw(uint256 amount) external 
        nonReentrant 
        updateReward(msg.sender) 
    {
        if (block.timestamp < stakingStart[msg.sender] + MINIMUM_STAKING_PERIOD) {
            revert MinimumStakingPeriodNotMet();
        }
        
        s_totalSupply -= amount;
        s_balances[msg.sender] -= amount;
        
        emit Withdrawn(msg.sender, amount);
        
        bool success = s_stakingToken.transfer(msg.sender, amount);
        if (!success) {
            revert TransferFailed();
        }
    }

    function claimReward() external 
        nonReentrant 
        updateReward(msg.sender) 
    {
        uint256 reward = s_rewards[msg.sender];
        s_rewards[msg.sender] = 0;
        
        emit RewardsClaimed(msg.sender, reward);
        
        bool success = s_rewardsToken.transfer(msg.sender, reward);
        if (!success) {
            revert TransferFailed();
        }
    }

    function emergencyWithdraw() external nonReentrant {
        require(emergencyStop, "Emergency stop not activated");
        uint256 amount = s_balances[msg.sender];
        s_balances[msg.sender] = 0;
        s_totalSupply -= amount;
        
        emit EmergencyWithdraw(msg.sender, amount);
        
        bool success = s_stakingToken.transfer(msg.sender, amount);
        if (!success) {
            revert TransferFailed();
        }
    }

    // // Owner functions
    // function setEmergencyStop(bool _stop) external onlyOwner {
    //     emergencyStop = _stop;
    // }

    // Modifiers
    modifier updateReward(address account) {
        s_rewardPerTokenStored = rewardPerToken();
        s_lastUpdateTime = block.timestamp;
        s_rewards[account] = earned(account);
        s_userRewardPerTokenPaid[account] = s_rewardPerTokenStored;
        _;
    }

    modifier moreThanZero(uint256 amount) {
        if (amount == 0) {
            revert NeedsMoreThanZero();
        }
        _;
    }

    // View functions
    function getStaked(address account) public view returns (uint256) {
        return s_balances[account];
    }
}