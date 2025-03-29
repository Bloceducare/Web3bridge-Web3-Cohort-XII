# Bitmap Contract

This contract demonstrates how to use a single `uint256` as a bitmap to store 32 individual byte values (8 bits each).

## Overview

A `uint256` in Solidity is 256 bits, which means it can be divided into 32 slots of 8 bits each (32 * 8 = 256). Each 8-bit slot can store a value between 0 and 255 (a byte).

## Contract Features

The contract provides the following functionalities:

1. **Store a byte value in a specific slot**
   ```solidity
   function storeValue(uint8 slot, uint8 value) external
   ```
   - `slot`: The slot index (0-31)
   - `value`: The byte value to store (0-255)

2. **Get value from a specific slot**
   ```solidity
   function getValue(uint8 slot) external view returns (uint8)
   ```
   - Returns the value stored at the specified slot

3. **Get all values as an array**
   ```solidity
   function getAllValues() external view returns (uint8[32] memory)
   ```
   - Returns an array of all 32 values

4. **Get the entire bitmap**
   ```solidity
   function getBitmap() external view returns (uint256)
   ```
   - Returns the entire bitmap as a single `uint256`

## How It Works

The contract manipulates the `uint256` bitmap using bit operations:

- To store a value, it:
  1. Creates a mask to clear the existing bits at the target position
  2. Shifts the new value to the correct position
  3. Uses the OR operation to set the bits in the bitmap

- To retrieve a value, it:
  1. Shifts the bits to the right position
  2. Uses a mask to isolate the specific byte

## Examples

```solidity
// Store the value 123 in slot 5
bitmap.storeValue(5, 123);

// Get the value from slot 5
uint8 value = bitmap.getValue(5); // Returns 123

// Get all values
uint8[32] memory allValues = bitmap.getAllValues();
```

## Gas Efficiency

This approach is gas-efficient because:
- It uses a single storage slot (`uint256`) instead of an array or mapping
- Reading and writing values require only a few bit operations
- The entire state can be read in a single SLOAD operation 