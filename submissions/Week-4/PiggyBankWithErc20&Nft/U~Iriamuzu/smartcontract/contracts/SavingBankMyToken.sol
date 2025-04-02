// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import "./token.sol";
import {IERC20} from "./token.sol";


contract ERC20PiggyBank {
    address public manager;
    IERC20 public token;
    uint256 public unlockTime;
    uint256 public withdrawalAmount;
    mapping(address => uint256) public deposits;

    event Deposited(address indexed sender, uint256 amount);
    event Withdrawn(address indexed receiver, uint256 amount);

    constructor(address _token, uint256 _lockDuration, uint256 _withdrawalAmount) {
        manager = msg.sender;
        token = IERC20(_token);
        unlockTime = block.timestamp + _lockDuration;
        withdrawalAmount = _withdrawalAmount;
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "Deposit must be greater than 0");
        require(token.transferFrom(msg.sender, address(this), amount), "Token transfer failed"); // Transfer tokens to the contract

        deposits[msg.sender] += amount; // What i deposited
        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
      require(msg.sender == manager, "Only manager can withdraw");
      require(block.timestamp >= unlockTime || token.balanceOf(address(this)) >= withdrawalAmount, "Funds locked"); // checking if the balance of the contract is greater than the withdrawal amount
      require(token.transfer(manager, amount), "Withdrawal failed"); // Transfer tokens to the manager

      emit Withdrawn(manager, amount);
    }

    function getBalance() external view returns (uint256) {
      return token.balanceOf(address(this)); // Return the balance of the contract
    }
}
