// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract BitmapStorage {
    uint256 private bitmap;

    /**
     * @notice Stores a byte value in a specific slot of the bitmap
     * @param slot The slot number (0-31)
     * @param value The byte value to store (0-255)
     */
    function storeValue(uint8 slot, uint8 value) public {
        require(slot < 32, "Slot must be between 0 and 31");
        require(value <= 255, "Value must be between 0 and 255");

        // Clear the slot first (8 bits)
        bitmap &= ~(0xFF << (slot * 8));
        // Set the new value
        bitmap |= (uint256(value) << (slot * 8));
    }

    /**
     * @notice Returns all values stored in the bitmap as an array
     * @return values Array of 32 bytes representing the values in each slot
     */
    function getAllValues() public view returns (uint8[] memory values) {
        values = new uint8[](32);
        for (uint8 i = 0; i < 32; i++) {
            values[i] = uint8((bitmap >> (i * 8)) & 0xFF);
        }
        return values;
    }

    /**
     * @notice Returns the value stored in a specific slot
     * @param slot The slot number (0-31)
     * @return value The byte value stored in the specified slot
     */
    function getValue(uint8 slot) public view returns (uint8) {
        require(slot < 32, "Slot must be between 0 and 31");
        return uint8((bitmap >> (slot * 8)) & 0xFF);
    }

    /**
     * @notice Returns the raw bitmap value
     * @return The complete uint256 bitmap
     */
    function getBitmap() public view returns (uint256) {
        return bitmap;
    }
}
