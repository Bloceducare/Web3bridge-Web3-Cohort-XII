// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./Erc20.sol";

contract StackingContract {
    IERC20 public immutable stakingToke;
    uint256 public constant MINIMUM_STAKING_TIME = 7 days;
    uint256 public constant REWARD_RATE = 10;

    struct stakeInfo {
        uint256 stake;
        uint256 startTime;
        bool withdrawal;
    }

    mapping(address => stakeInfo) public stakes;

    error zeroAmount();
    error AlreadyStaking();
    error NoActiveStake();
    error StakeLocked(uint256 remainingTime);
    error TransferFailed();

    event Staked(address indexed user, uint256 amount, uint256 startTime);
    event Withdrawal(address indexed user, uint256 amount, uint256 Reward);

    constructor(address _stakingToken){
        stakingToke = IERC20(_stakingToken);
    }

    function stake(uint256 _amount) external nonReentrant{
        if(_amount == 0) revert ZeroAmount();
        if(stakes[msg.sender].amount > 0) revert AlreadyStaking();

        stakes[msg.sender] = stakeInfo(_amount, block.stamp, false);

        if(!stakingToken.transferFrom(msg.send, address(this), _amount)){
            revert TransferFailed();
        }

        emit staked(msg.sender, _amount, block.timestamp);
    }


    function withdraw() external nonReentrant{
        stakeInfo storage userStake = stakes[msg.sender];
        if(userStake.amount = 0) revert NoActiveStake();
        if(block.time < userStake.startTime + MINIMUM_STAKING_TIME){
            revert stakeLocked((userStake.startTime + MINIMUM_STAKING_TIME) - block.timestamp);
        }

        uint256 reward = (userStake.amount * REWARD_RATE);
        uint256 totalAmount = userStake.amount + reward;
        userStacke.withdrawal = true;

        if(!stakingToken.transfer(msg.sender, totalAmount){
            revert TransferFailed();
        })

        emit withdraw(msg.sender, userStake.amount, reward);

         }
}
