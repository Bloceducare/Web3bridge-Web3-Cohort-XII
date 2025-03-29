// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "forge-std/Script.sol";
import "../src/Bitmap.sol";

contract BitmapScript is Script {
    function run() external {
        vm.startBroadcast();
        
        // Deploy the bitmap contract
        Bitmap bitmap = new Bitmap();
        console.log("Bitmap contract deployed at:", address(bitmap));
        
        // Store some values
        bitmap.storeValue(0, 123);  // Store 123 in slot 0
        bitmap.storeValue(1, 45);   // Store 45 in slot 1
        bitmap.storeValue(31, 255); // Store 255 in slot 31 (last slot)
        
        // Retrieve a specific value
        uint8 value0 = bitmap.getValue(0);
        console.log("Value at slot 0:", value0);
        
        // Get the entire bitmap
        uint256 entireBitmap = bitmap.getBitmap();
        console.log("Entire bitmap (hex):", entireBitmap);
        
        vm.stopBroadcast();
    }
} 