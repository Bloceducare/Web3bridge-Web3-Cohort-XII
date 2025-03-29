// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BitmapStorage {
    // Using uint256 to store 32 bytes (8 bits each)
    uint256 private bitmap;

    // Function to store a byte in a specific slot
    function storeByte(uint8 slot, uint8 value) public {
        require(slot < 32, "Slot must be between 0 and 31");
        require(value <= 0xFF, "Value must be between 0 and 255");

        // Clear the slot first (8 bits)
        bitmap &= ~(0xFF << (slot * 8));
        // Set the new value
        bitmap |= (uint256(value) << (slot * 8));
    }

    // Function to get all values as an array
    function getAllValues() public view returns (uint8[] memory) {
        uint8[] memory values = new uint8[](32);
        for (uint8 i = 0; i < 32; i++) {
            values[i] = uint8((bitmap >> (i * 8)) & 0xFF);
        }
        return values;
    }

    // Function to get value in a specific slot
    function getValue(uint8 slot) public view returns (uint8) {
        require(slot < 32, "Slot must be between 0 and 31");
        return uint8((bitmap >> (slot * 8)) & 0xFF);
    }
} 