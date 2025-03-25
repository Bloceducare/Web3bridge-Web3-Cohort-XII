// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.28;

import "./Erc20.sol";

contract Staking {
    struct Stake {
        uint256 amount;
        uint256 roi;
        uint256 reward;
        uint256 stakeTime;
        uint256 initialStakeTime;
    }

    mapping(address => Stake) stakes;
    uint256 public roi;
    RewardToken tokenInstance;
    mapping(address => bool) withdrawn;
    
    error NotStaked();
    error AddressZero();
    error InsufficientFunds();
    error NotWithdrawalTime();
    error InvalidAmount();
    error InvalidToken();
    error InvalidRoi();
    error InsufficientAllowance();
    error TransferFailed();
    error InvalidStakeTime();

    event Staked(address indexed staker, uint256 value);
    event Withdrawn(address indexed staker, uint256 value);

    constructor(uint256 _roi) {
        if(_roi == 0) revert InvalidRoi();
        
        roi = _roi;
        tokenInstance = new RewardToken();
    }

    function stake(uint256 _value, uint256 _stakeTime) external returns(bool) {
        if (_value == 0) revert InvalidAmount();
        if (tokenInstance.balanceOf(msg.sender) < _value) revert InsufficientFunds();
        if (tokenInstance.allowance(msg.sender, address(this)) < _value) revert InsufficientAllowance();
        if (_stakeTime <= block.timestamp) revert InvalidStakeTime();

        bool success = tokenInstance.transferFrom(msg.sender, address(this), _value);
        if (!success) revert TransferFailed();

        uint256 stakingDuration = _stakeTime - block.timestamp;
        uint256 rewardRate = (roi * stakingDuration) / 365 days;
        uint256 reward = (_value * rewardRate) / 100;

        stakes[msg.sender] = Stake({
            amount: _value,
            roi: roi,
            reward: reward,
            stakeTime: _stakeTime,
            initialStakeTime: block.timestamp
        });

        emit Staked(msg.sender, _value);
        return true;
    }

    function withdrawStakes() external returns (bool) {
        Stake storage userStake = stakes[msg.sender];
        
        if (userStake.amount == 0) revert NotStaked();
        if (block.timestamp < userStake.stakeTime) revert NotWithdrawalTime();

        uint256 fullReward = userStake.amount + calculateReward(msg.sender);

        if(tokenInstance.balanceOf(address(this)) < fullReward) revert InsufficientFunds();

        delete stakes[msg.sender];

        bool success = tokenInstance.transfer(msg.sender, fullReward);
        if (!success) revert TransferFailed();
        
        emit Withdrawn(msg.sender, fullReward);
        return true;
    }

    function calculateReward(address _address) public view returns(uint256) {
        Stake memory userStake = stakes[_address];
        if (userStake.amount == 0) return 0;

        uint256 timeStaked = block.timestamp - userStake.initialStakeTime;
        uint256 daysStaked = (timeStaked * 1e18) / 1 days;
        
        return (userStake.reward * daysStaked) / 1e18;
    }

    // function getStakeInfo(address _address) external view returns (
    //     uint256 amount,
    //     uint256 reward,
    //     uint256 stakeTime,
    //     uint256 initialStakeTime
    // ) {
    //     Stake memory userStake = stakes[_address];
    //     return (
    //         userStake.amount,
    //         calculateReward(_address),
    //         userStake.stakeTime,
    //         userStake.initialStakeTime
    //     );
    // }
}