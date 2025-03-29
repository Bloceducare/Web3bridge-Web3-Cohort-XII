// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/BitmapStorage.sol";

contract BitmapStorageTest is Test {
    BitmapStorage bitmapStorage;

    function setUp() public {
        bitmapStorage = new BitmapStorage();
    }

    function testStoreAndRetrieve() public {
        bitmapStorage.store(0, 1);
        bitmapStorage.store(1, 0);
        bitmapStorage.store(2, 1);

        uint8[32] memory values = bitmapStorage.getAllValues();

        assertEq(values[0], 1);
        assertEq(values[1], 0);
        assertEq(values[2], 1);
    }

    function testStoreAndClear() public {
        bitmapStorage.store(3, 1);
        bitmapStorage.store(3, 0);

        uint8 value = bitmapStorage.getValue(3);
        assertEq(value, 0);
    }

    function testGetValueOutOfBounds() public {
        vm.expectRevert("Slot index out of bounds");
        bitmapStorage.getValue(32);
    }

    function testGetAllValues() public {
        bitmapStorage.store(5, 1);
        bitmapStorage.store(10, 1);
        uint8[32] memory values = bitmapStorage.getAllValues();

        assertEq(values[5], 1);
        assertEq(values[10], 1);
    }

    function testStoreInvalidSlot() public {
        vm.expectRevert("Slot index out of bounds");
        bitmapStorage.store(32, 1); // Attempt to store in an invalid slot
    }

    function testStoreAndRetrieveAllSlots() public {
        for (uint8 i = 0; i < 32; i++) {
            bitmapStorage.store(i, i % 2); // Store alternating values
        }
        uint8[32] memory values = bitmapStorage.getAllValues();
        for (uint8 i = 0; i < 32; i++) {
            assertEq(values[i], i % 2); // Check that the values are as expected
        }
    }
}
