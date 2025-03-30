// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BitmapStorage {
    // Single uint256 to store 32 individual byte values
    uint256 private storageBitmap;

    // Function to store a byte value in a specific slot (0-31)
    function storeByte(uint8 slot, uint8 value) public {
        // Validate slot is within 0-31 range
        require(slot < 32, "Slot must be between 0 and 31");

        // Calculate the bit position (each slot is 8 bits)
        uint256 bitPosition = slot * 8;

        // Create a mask to clear the existing bits in the slot
        uint256 clearMask = ~(0xFF << bitPosition);

        // Clear the existing bits and set new value
        storageBitmap = (storageBitmap & clearMask) | (uint256(value) << bitPosition);
    }

    // Function to retrieve a specific byte from a slot
    function getByteFromSlot(uint8 slot) public view returns (uint8) {
        // Validate slot is within 0-31 range
        require(slot < 32, "Slot must be between 0 and 31");

        // Calculate the bit position
        uint256 bitPosition = slot * 8;

        // Extract the byte value from the specified slot
        return uint8((storageBitmap >> bitPosition) & 0xFF);
    }

    // Function to return all values in each slot
    function getAllValues() public view returns (uint8[32] memory) {
        uint8[32] memory values;

        // Extract each byte from the bitmap
        for (uint8 i = 0; i < 32; i++) {
            values[i] = getByteFromSlot(i);
        }

        return values;
    }
}
