// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

// dmystical.coder@gmail.com

contract ByteStorage {
    // Our storage - one uint256 can hold 32 bytes (32 * 8 = 256 bits)
    uint256 public flagCount;
    
    // Store a byte (0-255) in a specific slot (0-31)
    function setByteAt(uint8 slot, uint8 value) public {
        require(slot < 32, "Invalid slot: must be 0-31");
        
        // Calculate bit position (each slot is 8 bits wide)
        uint256 position = slot * 8;
        
        // Create a mask to clear the existing byte at the slot
        // ~(0xff << position) creates 0s at the target position and 1s elsewhere
        uint256 clearMask = ~(0xff << position);
        
        // Clear the existing byte and set the new value
        flagCount = (flagCount & clearMask) | (uint256(value) << position);
    }
    
    // Get the byte value at a specific slot
    function getByteAt(uint8 slot) public view returns (uint8) {
        require(slot < 32, "Invalid slot: must be 0-31");
        
        // Calculate bit position
        uint256 position = slot * 8;
        
        // Shift right to move the target byte to the rightmost position
        // Then mask with 0xff (binary 11111111) to get only the byte value
        return uint8((flagCount >> position) & 0xff);
    }
    
    // Get all 32 byte values
    function getAllBytes() public view returns (uint8[32] memory) {
        uint8[32] memory result;
        
        for (uint8 i = 0; i < 32; i++) {
            result[i] = getByteAt(i);
        }
        
        return result;
    }
    
    // Reset all values to zero
    function reset() public {
        flagCount = 0;
    }
}