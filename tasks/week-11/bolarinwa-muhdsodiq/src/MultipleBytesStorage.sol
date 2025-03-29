// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract MultipleValueStorage {
    uint256 private bitmap;

    
    function storeValue(uint8 slot, uint8 value) public {
        require(slot < 32, "Slot must be between 0 and 31");
        require(value <= 0xFF, "Value must be a byte (0-255)");

        // Clear the slot first (shift left by 8 bits per slot)
        bitmap &= ~(0xFF << (slot * 8));
        // Set the new value
        bitmap |= (uint256(value) << (slot * 8));
    }

    // Get all values as an array of 32 bytes
    function getAllValues() public view returns (uint8[] memory) {
        uint8[] memory values = new uint8[](32);
        for (uint8 i = 0; i < 32; i++) {
            values[i] = uint8((bitmap >> (i * 8)) & 0xFF);
        }
        return values;
    }

 
    function getValue(uint8 slot) public view returns (uint8) {
        require(slot < 32, "Slot must be between 0 and 31");
        return uint8((bitmap >> (slot * 8)) & 0xFF);
    }
}
