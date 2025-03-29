// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract BitmapStorage {
    uint256 private bitmap;

    /// @dev Store a byte in a specific slot (0-31) of the bitmap.
    /// @param slot The slot index (0-31) to store the value.
    /// @param value The byte value to store (0 or 1).
    function store(uint8 slot, uint8 value) public {
        require(slot < 32, "Slot index out of bounds");
        require(value <= 1, "Value must be 0 or 1");

        if (value == 1) {
            bitmap |= (1 << slot); // Set the bit at the specified slot
        } else {
            bitmap &= ~(1 << slot); // Clear the bit at the specified slot
        }
    }

    /// @dev Return all values in each slot as an array of bytes.
    /// @return values An array of bytes representing the values in the slots.
    function getAllValues() public view returns (uint8[32] memory values) {
        for (uint8 i = 0; i < 32; i++) {
            values[i] = uint8((bitmap >> i) & 1);
        }
        return values;
    }

    /// @dev Return the value in a specific slot (0-31).
    /// @param slot The slot index (0-31) to retrieve the value from.
    /// @return value The value in the specified slot (0 or 1).
    function getValue(uint8 slot) public view returns (uint8) {
        require(slot < 32, "Slot index out of bounds");
        return uint8((bitmap >> slot) & 1);
    }
}
