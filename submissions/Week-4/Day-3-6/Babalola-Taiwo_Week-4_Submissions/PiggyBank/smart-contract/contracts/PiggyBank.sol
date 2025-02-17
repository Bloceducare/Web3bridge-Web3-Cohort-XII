// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract Piggy {
    address payable public immutable owner;
    uint256 public amountToSave;
    uint256 public fundInDeposit;
    uint256 public actionTime;  
    uint256 public duration;

    constructor () {
        owner = payable(msg.sender);
    }

    modifier ownerOnly() {
        require(msg.sender == owner, "Only owner authorized to save");
        _;
    }

    function depositFund(uint _amountToSave) public payable ownerOnly {
    require(msg.value > 0, "You must send some Ether");
    require(_amountToSave > 0, "You can't save less than 0 ethers");
    
    amountToSave = _amountToSave;
    fundInDeposit += msg.value; // Use `msg.value` instead of `_amountToSave`
    }

    function fundSaved(uint _amountToSave) public {
        depositFund(_amountToSave); 
    }

    function setActionTime(uint256 _durationInSeconds) external ownerOnly {
        duration = _durationInSeconds;
        actionTime = block.timestamp + duration;
    }

    function executeAction() external view {
        require(block.timestamp >= actionTime, "Action cannot be executed yet");
    }

    function timeRemaining() external view returns (uint256) {
        if (block.timestamp >= actionTime) {
            return 0;
        } else {
            return actionTime - block.timestamp;
        }
    }

    function withdraw(uint _amountToWithdraw) public ownerOnly {
        require(_amountToWithdraw <= fundInDeposit, "You don't have enough funds in your deposit");
        require(address(this).balance >= _amountToWithdraw, "You have insufficient contract funds");

        fundInDeposit -= _amountToWithdraw;
        payable(msg.sender).transfer(_amountToWithdraw);
    }

    receive() external payable {}
}
