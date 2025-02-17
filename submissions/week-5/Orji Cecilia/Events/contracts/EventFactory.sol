// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./Event.sol"; 

//This contract manages and deploys new event contracts
//Instead of deploying EventContract manually, this factory automates it.
//It stores all deployed events, making them easily retrievable.
contract EventFactory {
    address public owner;

    //store deployed event addresses
    address[] public deployedEvents; 

    event EventCreated(address eventAddress, address organizer);
    event FundsWithdrawn(address owner, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "ONLY OWNER CAN CALL THIS");
        _;
    }

    constructor() {
        //set factory owner
        owner = msg.sender; 
    }

    function createEventContract() external {

        //deploy new event contract
        EventContract newEvent = new EventContract(msg.sender);
        
        //push deployed event address to array
        deployedEvents.push(address(newEvent)); 
        emit EventCreated(address(newEvent), msg.sender);
    }

    function getDeployedEvents() external view returns (address[] memory) {
        return deployedEvents;
    }

    //withdraw contract funds
    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "NO FUNDS TO WITHDRAW");
        payable(owner).transfer(balance);
        emit FundsWithdrawn(owner, balance);
    }
    //allow contract to receive ether
    receive() external payable {} 
}
