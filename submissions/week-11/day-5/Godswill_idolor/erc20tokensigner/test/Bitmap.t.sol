// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "forge-std/Test.sol";
import "../src/Bitmap.sol";

contract BitmapTest is Test {
    Bitmap public bitmap;

    function setUp() public {
        bitmap = new Bitmap();
    }

    function testStoreAndRetrieveValue() public {
        // Store a value in slot 5
        uint8 slotToTest = 5;
        uint8 valueToStore = 123;
        bitmap.storeValue(slotToTest, valueToStore);
        
        // Retrieve the value
        uint8 retrievedValue = bitmap.getValue(slotToTest);
        
        // Verify it's the same
        assertEq(retrievedValue, valueToStore, "Retrieved value should match stored value");
    }
    
    function testStoreMultipleValues() public {
        // Store several values in different slots
        bitmap.storeValue(0, 10);   // First slot
        bitmap.storeValue(15, 127); // Middle slot
        bitmap.storeValue(31, 255); // Last slot
        
        // Verify each value
        assertEq(bitmap.getValue(0), 10, "Value at slot 0 should be 10");
        assertEq(bitmap.getValue(15), 127, "Value at slot 15 should be 127");
        assertEq(bitmap.getValue(31), 255, "Value at slot 31 should be 255");
    }
    
    function testGetAllValues() public {
        // Store some values
        bitmap.storeValue(3, 42);
        bitmap.storeValue(10, 77);
        bitmap.storeValue(27, 198);
        
        // Get all values
        uint8[32] memory values = bitmap.getAllValues();
        
        // Verify specific slots
        assertEq(values[3], 42, "Values array slot 3 should be 42");
        assertEq(values[10], 77, "Values array slot 10 should be 77");
        assertEq(values[27], 198, "Values array slot 27 should be 198");
        
        // Other slots should be 0
        assertEq(values[0], 0, "Values array slot 0 should be 0");
        assertEq(values[31], 0, "Values array slot 31 should be 0");
    }
    
    function testOverwriteValue() public {
        // Store a value
        bitmap.storeValue(8, 100);
        assertEq(bitmap.getValue(8), 100, "Initial value should be 100");
        
        // Overwrite with a new value
        bitmap.storeValue(8, 200);
        assertEq(bitmap.getValue(8), 200, "Value should be updated to 200");
    }
    
    function testGetBitmap() public {
        // Set up a known pattern
        bitmap.storeValue(0, 0xAA); // 170 in decimal
        bitmap.storeValue(1, 0xBB); // 187 in decimal
        
        // Expected bitmap: 0xBBAA (48042 in decimal)
        uint256 expectedBitmap = 0xBBAA;
        uint256 actualBitmap = bitmap.getBitmap();
        
        assertEq(actualBitmap, expectedBitmap, "Bitmap should match the expected value");
    }
    
    function testSlotOutOfBounds() public {
        // Try to access an out-of-bounds slot
        vm.expectRevert("Slot must be 0-31");
        bitmap.storeValue(32, 100);
        
        vm.expectRevert("Slot must be 0-31");
        bitmap.getValue(33);
    }
} 