// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28; 

contract piggyBank {

     //state variables
     uint256 public targetAmount;
     mapping (address => uint256) public contributions;
     uint256 public immutable withdrawalDate;
     uint8 public contributorsCount;
     address public manager;

     // Events
     event Contributed (
          address indexed Contributor,
          uint256 amount,
          uint256 time
     );
    
     event Withdrawn (
          uint256 amount,
          uint256 time
     ); 

     //constructor    
     constructor (uint256 _targetAmount, uint256 _withdrawalDate, address _manager) {
          require (_withdrawalDate > block.timestamp, 'Withdrawal must be in future');

          targetAmount = _targetAmount;
          withdrawalDate = _withdrawalDate;
          manager = _manager;
     }

     //modifier
     modifier onlyManager () {
          require(msg.sender == manager, "you are not authorized");
          _;
     }

     // save
     function save () external payable {
          require(msg.sender != address(0), "UNAUTHORIZED");
          require(block.timestamp <= withdrawalDate, 'you can no longer save');
          require(msg.value > 0, "you are broke");
          
          //to check if the caller is a first timer
          if (contributions[msg.sender] == 0) {
                contributorsCount += 1;
          }
          contributions[msg.sender] += msg.value;
          emit Contributed(msg.sender, msg.value, block.timestamp);
     }

     // withdrawal
     function withdrawal () external onlyManager {
          //require that withdrawal time os >=
          require(block.timestamp >= withdrawalDate, 'not yet time');

          //require that the balance >= target amount
          require (address(this).balance >= targetAmount, 'amount not reached');

          uint256 _contractBal = address(this).balance;

          //transfer to manager
          payable(manager).transfer(_contractBal);

          emit Withdrawn(_contractBal, block.timestamp);
     }
     
}