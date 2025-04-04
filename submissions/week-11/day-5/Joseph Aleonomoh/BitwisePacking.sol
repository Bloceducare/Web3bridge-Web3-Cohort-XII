// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract BitwisePacking {
    uint256 public packedBool;

    function addValueToSlot(uint8 value, uint8 slot) public {
        require(slot < 32, "Slot must be less than 32");
        uint256 shiftValue = uint256(slot) * 8;
        uint256 _packedBool = ~(uint256(255) << shiftValue) & packedBool;
        packedBool = (uint256(value) << shiftValue) | _packedBool;
    }

    function readValueFromSlot(uint8 slot) public view returns (uint8) {
        require(slot < 32, "Slot must be less than 32");                      
        uint256 shiftValue = uint256(slot) * 8;
        uint8 value = uint8((packedBool >> shiftValue) & 255);
        return value;
    }

    function getAllValues() public view returns (uint8[] memory) {
        uint8[] memory values = new uint8[](32);
        for(uint8 slot=0; slot < 32; slot ++) {
            values[slot] = readValueFromSlot(slot);
        }
        return values;
    }
}