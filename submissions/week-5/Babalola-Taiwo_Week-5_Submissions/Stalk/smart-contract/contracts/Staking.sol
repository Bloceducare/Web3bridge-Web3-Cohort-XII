// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./ERC20.sol";

contract Staking {
    error NoStake();
    error StillLocked();
    error TransferFailed();
    error LockTooShort();
    
    LagCoin public token;
    uint256 public constant REWARD_RATE = 100;
    uint256 public constant MIN_LOCK = 7 days;
    
    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 lockTime;
    }
    
    mapping(address => Stake) public stakes;
    
    constructor(address _token) { 
        token = LagCoin(_token); 
    }
    
    function stake(uint256 amount, uint256 lockTime) external {
        if(lockTime < MIN_LOCK) revert LockTooShort();
        if(!token.transferFrom(msg.sender, address(this), amount)) revert TransferFailed();
        stakes[msg.sender] = Stake(amount, block.timestamp, lockTime);
    }
    
    function withdraw() external {
        Stake memory userStake = stakes[msg.sender];
        if(userStake.amount == 0) revert NoStake();
        if(block.timestamp < userStake.startTime + userStake.lockTime) revert StillLocked();
        
        uint256 reward = (userStake.amount * REWARD_RATE * (block.timestamp - userStake.startTime)) / (100 * 1 days);
        delete stakes[msg.sender];
        
        if(!token.transfer(msg.sender, userStake.amount + reward)) revert TransferFailed();
    }
}