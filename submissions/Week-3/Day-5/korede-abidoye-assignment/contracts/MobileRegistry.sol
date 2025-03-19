// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MobileRegistry {
    address public owner;

    struct MobilePhone {
        uint id;
        string model;
        string serialNumber;
        bool isRegistered;
    }

    mapping(uint => MobilePhone) public phones;
    uint public phoneCount;

    event PhoneRegistered(uint id, string model, string serialNumber);
    event PhoneDeregistered(uint id);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    modifier phoneExists(uint _id) {
        require(_id < phoneCount, "Phone doesn't exist");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerPhone(string memory _model, string memory _serialNumber) external onlyOwner {
        phones[phoneCount] = MobilePhone(phoneCount, _model, _serialNumber, true);
        emit PhoneRegistered(phoneCount, _model, _serialNumber);
        phoneCount++;
    }

    function deregisterPhone(uint _id) external onlyOwner phoneExists(_id) {
        phones[_id].isRegistered = false;
        emit PhoneDeregistered(_id);
    }
}