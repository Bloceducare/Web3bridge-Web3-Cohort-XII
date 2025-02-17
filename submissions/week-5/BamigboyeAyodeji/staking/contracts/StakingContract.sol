// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.28;

import {MyERC20} from './MyERC20.sol';

contract StackingContract {
    address public owner;
    MyERC20 public token;

    struct Stake {
        uint256 amount;
        uint256 start;
        uint256 end;
    }

    mapping(address => uint256) public stakedBalances;
    mapping(address => Stake[]) public stakes;

    event Staked(address indexed user, uint256 amount, uint256 start, uint256 end);
    event Unstaked(address indexed user, uint256 amount, uint256 start, uint256 end);

    error InssufficientBalance();
    error InvalidAccountId();
    error InvalidAddress();
    error InvalidAmount();
    error NoStackedBalance();
    error PeriodNotEnded();
    error Unauthorized();

    modifier isOwner() {
        if (owner != msg.sender)
            revert Unauthorized();
        
        _;
    }

    constructor(address _token) {
        owner = msg.sender;
        token = MyERC20(_token);
    }

    function stake(uint256 amount, uint256 duration) external payable {
        if (token.balanceOf(msg.sender) < amount)
            revert InssufficientBalance();
        
        token.transferFrom(msg.sender, address(this), amount);

        stakes[msg.sender].push(Stake(amount, block.timestamp, block.timestamp + duration));
        stakedBalances[msg.sender] += amount;

        emit Staked(msg.sender, amount, block.timestamp, block.timestamp + duration);
    }

    function unStake(uint256 accountId) external isOwner {
        if (stakes[msg.sender].length <= accountId)
            revert InvalidAccountId();


        uint256 amount = stakes[msg.sender][accountId].amount;
        token.transfer(msg.sender, amount);

        stakedBalances[msg.sender] -= amount;

        emit Unstaked(msg.sender, amount, stakes[msg.sender][accountId].start, stakes[msg.sender][accountId].end);
    }

    function withdrawable(address user, uint amount) external isOwner {

        if (user != address(0))
            revert InvalidAddress();

        if (amount > 0)
            revert InvalidAmount();

        if (stakedBalances[user] > 0)
            revert NoStackedBalance();

        if (block.timestamp > stakes[user][stakes[user].length - 1].end)
            revert PeriodNotEnded();

        uint256 rewards = (block.timestamp - stakes[user][stakes[user].length - 1].end) / 86400;

        // payement of rewards
        token.transfer(user, rewards);

        // check if the amount is dufficient and withdraz
        if (token.balanceOf(user) >= amount)
            revert InssufficientBalance();

        // withdraw the tokens
        stakedBalances[user] -= amount;
        payable(user).transfer(amount);

    }
}
