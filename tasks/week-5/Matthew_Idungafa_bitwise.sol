// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract BitmapStorage {
    uint256 packedData;

    function setByte(uint position, uint8 value) public {
        if (position >= 32) {
            revert("Position must be 0-31");
        }

        // First clear the bits at position
        uint256 mask = ~(uint256(0xFF) << (position * 8));
        packedData = packedData & mask;

        // Then set the new value
        packedData = packedData | (uint256(value) << (position * 8));
    }

    // Get byte from specific position
    function getByte(uint position) public view returns (uint8) {
        if (position >= 32) {
            revert("Position must be 0-31");
        }

        return uint8((packedData >> (position * 8)) & 0xFF);
    }

    // Get all bytes as array
    function getAllBytes() public view returns (uint8[32] memory) {
        uint8[32] memory bytesArray;

        for (uint i = 0; i < 32; i++) {
            bytesArray[i] = uint8((packedData >> (i * 8)) & 0xFF);
        }

        return bytesArray;
    }

    function seeRawData() public view returns (uint256) {
        return packedData;
    }
}
