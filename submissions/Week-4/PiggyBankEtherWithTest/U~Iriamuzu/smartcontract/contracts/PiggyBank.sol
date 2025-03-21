// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.28;

contract PiggyBank {

  uint256 public  targetAmount;
  mapping(address => uint256) public contributions;
  uint256 public immutable withdrawalDate; // so that we will initialize this when we first deploy
  address public manager;
  uint32 public contributorsCount;

  // events
  event Contributed (address indexed Contributor, uint256 amount, uint time); // indexed to make it assessable
  event WithDrawn (uint256 amount, uint time);

  modifier onlyManager() {
    require(msg.sender == manager, "Only the manager can call this function");
    _;
  }

  constructor(uint256 _targetAmount, uint256 _withdrawalDate, address _manager) {
    require(_withdrawalDate > block.timestamp, "Withdrawal date must be in the future");

    targetAmount = _targetAmount;
    withdrawalDate = _withdrawalDate;
    manager = _manager;
  }

  function deposit() external payable { // payable: for the user to send ether
    require(msg.sender != address(0), "Invalid address");
    require(block.timestamp <= withdrawalDate, "Withdrawal date has passed");
    require(msg.value > 0, "You are Broke"); 

    if(contributions[msg.sender] == 0) { // if the user has not contributed before
      contributorsCount += 1;
    }

    contributions[msg.sender] += msg.value;
    emit Contributed(msg.sender, msg.value, block.timestamp);
  }

  // withdraw function
  function withdrawl() external onlyManager {
    require(block.timestamp >= withdrawalDate, "Withdrawal date has not passed");
    require(address(this).balance >= targetAmount, "Target amount not met"); // check if the target amount is met, this means that the manager can only withdraw if the target amount is met

    uint256 _contractBal = address(this).balance; // get the contract balance

    emit WithDrawn(_contractBal, block.timestamp); 

    payable(msg.sender).transfer(address(this).balance); // transfer the balance to the manager    
  }



  

}