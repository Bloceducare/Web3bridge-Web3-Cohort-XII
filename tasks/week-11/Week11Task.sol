// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Bitmap {
    uint256 private bitmap; // A 256-bit integer used as the bitmap storage

    // Set a bit at a given index (0-255)
    function setBit(uint8 index) public {
        require(index < 256, "Index out of range");
        bitmap |= (1 << index);
    }

    // Clear a bit at a given index (set it to 0)
    function clearBit(uint8 index) public {
        require(index < 256, "Index out of range");
        bitmap &= ~(1 << index);
    }

    // Toggle a bit at a given index
    function toggleBit(uint8 index) public {
        require(index < 256, "Index out of range");
        bitmap ^= (1 << index);
    }

    // Check if a bit is set
    function isBitSet(uint8 index) public view returns (bool) {
        require(index < 256, "Index out of range");
        return (bitmap & (1 << index)) != 0;
    }

    // Get the entire bitmap value (for debugging)
    function getBitmap() public view returns (uint256) {
        return bitmap;
    }
}
