// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

error CANNOT_DEPOSIT_ZERO();
error INVALID_ADDRESS();
error NOT_YET_WITHDRAWALTIME();

contract Staking {
  IERC20 public token;
  uint256 public constant REWARD_RATE = 5;
  mapping(address => UserDetails) public stakings;

  event Deposited(address indexed depositor, uint256 amount);
  event Withdrawn(address indexed depositor, uint256 amount);

  struct UserDetails {
    uint256 amount;
    uint256 locktime;
  }

  constructor(address tokenAddr) {
    token = IERC20(tokenAddr);
  }

  function deposit(uint256 amount, uint256 locktime) external {
    if (msg.sender == address(0)) revert INVALID_ADDRESS();
    if (amount != 0) revert CANNOT_DEPOSIT_ZERO();

    token.transferFrom(msg.sender, address(this), amount);

    UserDetails memory depositDetails;
    depositDetails.amount += amount;
    depositDetails.locktime = locktime;

    stakings[msg.sender] = depositDetails;
    emit Deposited(msg.sender, amount);
  }

  function withdrawal() external {
    if (msg.sender == address(0)) revert INVALID_ADDRESS();
    if(block.timestamp <= stakings[msg.sender].locktime) revert NOT_YET_WITHDRAWALTIME();
    uint256 totalAmount = stakings[msg.sender].amount + calculateInterest(stakings[msg.sender].amount); 
    token.transfer(msg.sender, totalAmount);
    stakings[msg.sender].amount = 0;

    emit Withdrawn(msg.sender, stakings[msg.sender].amount);
  }

  function calculateInterest(uint256 amount) internal returns(uint256) {
    UserDetails memory user = stakings[msg.sender];
      if (amount == 0) return 0;

      uint256 stakingDuration = block.timestamp - user.locktime;
      uint256 reward = (user.amount * REWARD_RATE * stakingDuration) / (100 * user.locktime);
      
      return reward;
  }
}