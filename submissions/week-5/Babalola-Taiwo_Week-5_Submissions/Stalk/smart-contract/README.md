// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./LagCoin.sol";

contract StakingSystem {
    LagCoin public token;
    
    error ZeroStake();
    error AlreadyStaking();
    error LockTimeTooShort();
    error LockTimeTooLong();
    error NoStakeFound();
    error StillLocked();
    error TransferFailed();
    
    uint256 public constant BASE_REWARD_RATE = 100;
    uint256 public constant MIN_LOCK_TIME = 1 days;
    uint256 public constant MAX_LOCK_TIME = 365 days;
    
    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 lockTime;
        uint256 rewardRate;
    }
    
    mapping(address => Stake) public userStakes;
    
    event Staked(address user, uint256 amount, uint256 lockTime);
    event Withdrawn(address user, uint256 amount, uint256 reward);
    
    constructor(address _tokenAddress) {
        token = LagCoin(_tokenAddress);
    }
    
    function stake(uint256 amount, uint256 lockTime) external {
        if(amount == 0) revert ZeroStake();
        if(userStakes[msg.sender].amount > 0) revert AlreadyStaking();
        if(lockTime < MIN_LOCK_TIME) revert LockTimeTooShort();
        if(lockTime > MAX_LOCK_TIME) revert LockTimeTooLong();
        
        uint256 rewardRate = BASE_REWARD_RATE + (lockTime * BASE_REWARD_RATE / MAX_LOCK_TIME);
        
        if(!token.transferFrom(msg.sender, address(this), amount)) {
            revert TransferFailed();
        }
        
        userStakes[msg.sender] = Stake(
            amount,
            block.timestamp,
            lockTime,
            rewardRate
        );
        
        emit Staked(msg.sender, amount, lockTime);
    }
    
    function withdraw() external {
        Stake memory userStake = userStakes[msg.sender];
        if(userStake.amount == 0) revert NoStakeFound();
        
        uint256 timeStaked = block.timestamp - userStake.startTime;
        if(timeStaked < userStake.lockTime) revert StillLocked();
        
        uint256 reward = (userStake.amount * userStake.rewardRate * timeStaked) 
                        / (100 * 1 days);
        uint256 total = userStake.amount + reward;
        
        delete userStakes[msg.sender];
        
        if(!token.transfer(msg.sender, total)) {
            revert TransferFailed();
        }
        
        emit Withdrawn(msg.sender, userStake.amount, reward);
    }
    
    function getStakeInfo(address user) external view returns (
        uint256 amount,
        uint256 startTime,
        uint256 lockTime,
        uint256 reward,
        uint256 timeLeft
    ) {
        Stake memory stake = userStakes[user];
        
        if (stake.amount == 0) {
            return (0, 0, 0, 0, 0);
        }
        
        uint256 timeStaked = block.timestamp - stake.startTime;
        uint256 remainingLockTime = timeStaked >= stake.lockTime ? 
                                  0 : stake.lockTime - timeStaked;
        
        uint256 currentReward = (stake.amount * stake.rewardRate * timeStaked) 
                               / (100 * 1 days);
        
        return (
            stake.amount,
            stake.startTime,
            stake.lockTime,
            currentReward,
            remainingLockTime
        );
    }
}