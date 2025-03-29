// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BitmapStorage {
    uint256 private bitmap;

    function storeBit(uint8 slot, bool value) external {
        require(slot < 32, "Slot must be between 0 and 31");

        if (value) {
            bitmap |= (1 << slot);
        } else {
            bitmap &= ~(1 << slot);
        }
    }

    function getBit(uint8 slot) external view returns (bool) {
        require(slot < 32, "Slot must be between 0 and 31");

        return (bitmap & (1 << slot)) != 0;
    }

    function getAllBits() external view returns (bool[32] memory) {
        bool[32] memory bits;

        for (uint8 i = 0; i < 32; i++) {
            bits[i] = (bitmap & (1 << i)) != 0;
        }

        return bits;
    }

    function getRawBitmap() external view returns (uint256) {
        return bitmap;
    }
}
