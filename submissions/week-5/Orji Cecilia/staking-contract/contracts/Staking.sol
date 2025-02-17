// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

"Build a Solidity smart contract for a staking system where users can stake tokens and earn rewards over time. The contract should include the following features:

// Users can deposit (stake) ERC20 tokens into the contract.
// The contract should track each user's staked amount and staking duration.
// Rewards should be calculated based on the staking period and distributed accordingly.
// Users should be able to withdraw their stake along with earned rewards after a minimum staking period.
// Ensure the contract is gas-efficient and secure against potential vulnerabilities such as reentrancy attacks." Would you like me to add extra requirements or provide a sample template to guide them? 🚀

contract Staking {
    IERC20 public immutable stakingToken;  
    uint256 public constant MIN_STAKING_TIME = 7 days;  
    uint256 public constant REWARD_RATE = 1e16;  

    struct StakeInfo {
        uint256 amount;
        uint256 stakedAt;
        uint256 rewardsClaimed;
    }

    mapping(address => StakeInfo) public stakes;
    uint256 public totalStaked;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount, uint256 rewards);
    event RewardRateUpdated(uint256 newRate);

    constructor(address _token) {
        require(_token != address(0), "Invalid token address");
        stakingToken = IERC20(_token);
    }

    function stake(uint256 _amount) external {
        require(_amount > 0, "Cannot stake zero tokens");

        stakingToken.transferFrom(msg.sender, address(this), _amount);

        if (stakes[msg.sender].amount > 0) {
            // Update rewards before modifying stake amount
            uint256 pendingRewards = calculateRewards(msg.sender);
            stakes[msg.sender].rewardsClaimed += pendingRewards;
        }

        stakes[msg.sender].amount += _amount;
        stakes[msg.sender].stakedAt = block.timestamp;

        totalStaked += _amount;
        emit Staked(msg.sender, _amount);
    }

    function withdraw() external {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.amount > 0, "No stake found");
        require(block.timestamp >= userStake.stakedAt + MIN_STAKING_TIME, "Staking period not reached");

        uint256 rewards = calculateRewards(msg.sender);
        uint256 totalAmount = userStake.amount + rewards;

        totalStaked -= userStake.amount;

        userStake.amount = 0;
        userStake.rewardsClaimed = 0;

        stakingToken.transfer(msg.sender, totalAmount);
        emit Withdrawn(msg.sender, userStake.amount, rewards);
    }

    function calculateRewards(address _user) public view returns (uint256) {
        StakeInfo storage userStake = stakes[_user];
        if (userStake.amount == 0) return 0;

        uint256 timeElapsed = block.timestamp - userStake.stakedAt;
        uint256 totalRewards = (userStake.amount * timeElapsed * REWARD_RATE) / 1e18;

        return totalRewards - userStake.rewardsClaimed;
    }

    function getStakedAmount(address _user) external view returns (uint256) {
        return stakes[_user].amount;
    }

    function updateRewardRate(uint256 _newRate) external {
        require(msg.sender == address(this), "Only contract can update reward rate");
        emit RewardRateUpdated(_newRate);
    }
}
