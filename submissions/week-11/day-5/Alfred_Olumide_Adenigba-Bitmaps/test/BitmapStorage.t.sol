// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/BitmapStorage.sol";

contract BitmapStorageTest is Test {
    BitmapStorage public bitmapStorage;

    // Setup function to deploy the contract before each test
    function setUp() public {
        bitmapStorage = new BitmapStorage();
    }

    // Test contract deployment
    function testDeployment() public view {
        // Simply assert that the contract address is not zero
        assertTrue(address(bitmapStorage) != address(0), "Contract should be deployed");
    }

    // Test storing and retrieving a single byte
    function testStoreByte() public {
        // Store a byte in slot 5 with value 42
        bitmapStorage.storeByte(5, 42);

        // Retrieve the byte and check it matches
        uint8 retrievedValue = bitmapStorage.getByteFromSlot(5);
        assertEq(retrievedValue, 42, "Retrieved value should match stored value");
    }

    // Test storing multiple bytes in different slots
    function testStoreMultipleBytes() public {
        // Store different values in different slots
        bitmapStorage.storeByte(0, 10);
        bitmapStorage.storeByte(15, 255);
        bitmapStorage.storeByte(31, 100);

        // Check each stored value
        assertEq(bitmapStorage.getByteFromSlot(0), 10, "First slot value incorrect");
        assertEq(bitmapStorage.getByteFromSlot(15), 255, "Mid slot value incorrect");
        assertEq(bitmapStorage.getByteFromSlot(31), 100, "Last slot value incorrect");
    }

    // Test retrieving all values
    function testGetAllValues() public {
        // Store some values in different slots
        bitmapStorage.storeByte(0, 10);
        bitmapStorage.storeByte(5, 42);
        bitmapStorage.storeByte(15, 255);
        bitmapStorage.storeByte(31, 100);

        // Retrieve all values
        uint8[32] memory allValues = bitmapStorage.getAllValues();

        // Check specific stored values
        assertEq(allValues[0], 10, "First slot value incorrect");
        assertEq(allValues[5], 42, "Fifth slot value incorrect");
        assertEq(allValues[15], 255, "Fifteenth slot value incorrect");
        assertEq(allValues[31], 100, "Last slot value incorrect");
    }

    // Test reverting on invalid slot (above 31)
    function testRevertWhenSlotInvalid_Store() public {
        // Expect this call to revert with a specific message
        vm.expectRevert("Slot must be between 0 and 31");
        bitmapStorage.storeByte(32, 42);
    }

    // Test reverting on invalid slot when getting byte
    function testRevertWhenSlotInvalid_Get() public {
        // Expect this call to revert with a specific message
        vm.expectRevert("Slot must be between 0 and 31");
        bitmapStorage.getByteFromSlot(32);
    }

    // Test overwriting an existing slot
    function testOverwriteSlot() public {
        // Store initial value
        bitmapStorage.storeByte(10, 50);
        assertEq(bitmapStorage.getByteFromSlot(10), 50, "Initial value incorrect");

        // Overwrite with new value
        bitmapStorage.storeByte(10, 75);
        assertEq(bitmapStorage.getByteFromSlot(10), 75, "Overwritten value incorrect");
    }
}
