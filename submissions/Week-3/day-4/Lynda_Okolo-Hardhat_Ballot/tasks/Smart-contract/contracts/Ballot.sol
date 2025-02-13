// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Ballot {
    uint256 private storedData;

    // Event to log changes to the stored data
    event DataStored(uint256 newValue);

    // Function to store a number
    function store(uint256 _value) public {
        storedData = _value;
        emit DataStored(_value); // Emit event
    }

    // Function to retrieve the stored number
    function retrieve() public view returns (uint256) {
        return storedData;
    }
}