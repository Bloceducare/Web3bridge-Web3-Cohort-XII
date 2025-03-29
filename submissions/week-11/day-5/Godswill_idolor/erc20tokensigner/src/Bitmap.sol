// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract Bitmap {
    // Single uint256 to store 32 bytes (8 bits each)
    uint256 private bitmap;

    // Store a byte value (0-255) in a specific slot (0-31)
    function storeValue(uint8 slot, uint8 value) external {
        // Validate slot is within range
        require(slot < 32, "Slot must be 0-31");

        // Clear the existing value at the slot
        // Create a mask with all 1's
        uint256 mask = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF;
        // Shift the mask to create 8 zeros at the target position
        mask = mask ^ (0xFF << (slot * 8));
        // Apply the mask to clear the current value
        bitmap = bitmap & mask;

        // Store the new value
        // Shift the value to the correct position and OR it with the bitmap
        bitmap = bitmap | (uint256(value) << (slot * 8));
    }

    // Get value from a specific slot
    function getValue(uint8 slot) external view returns (uint8) {
        // Validate slot is within range
        require(slot < 32, "Slot must be 0-31");

        // Extract the value by shifting right to the lowest 8 bits and masking
        return uint8((bitmap >> (slot * 8)) & 0xFF);
    }

    // Get all values in an array
    function getAllValues() external view returns (uint8[32] memory) {
        uint8[32] memory values;
        
        for (uint8 i = 0; i < 32; i++) {
            // Extract each byte from the bitmap
            values[i] = uint8((bitmap >> (i * 8)) & 0xFF);
        }
        
        return values;
    }

    // Get the entire bitmap
    function getBitmap() external view returns (uint256) {
        return bitmap;
    }
} 