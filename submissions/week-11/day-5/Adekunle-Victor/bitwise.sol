// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Uint256Bitmap {
    uint256 private bitmap;

    function storeByte(uint8 value, uint8 index) external {
        require(index < 32, "Data out of bound");

        uint256 shiftAmount = index * 8;
        uint256 mask = ~(uint256(0xFF) << shiftAmount);

        bitmap = (bitmap & mask) | (uint256(value) << shiftAmount);
    }

    function getByte(uint8 index) external view returns (uint8) {
        require(index < 32, "Data out of bound");

        uint256 shiftAmount = index * 8;
        return uint8((bitmap >> shiftAmount) & 0xFF);
    }

    function getAllBytes() external view returns (uint8[32] memory) {
        uint8[32] memory values;
        for (uint8 i = 0; i < 32; i++) {
            values[i] = uint8((bitmap >> (i * 8)) & 0xFF);
        }
        return values;
    }
}
