// Simple JavaScript test for the Bitmap contract
const { ethers } = require('ethers');

// ABI for the Bitmap contract functions we want to test
const bitmapABI = [
  "function storeValue(uint8 slot, uint8 value) external",
  "function getValue(uint8 slot) external view returns (uint8)",
  "function getAllValues() external view returns (uint8[32])",
  "function getBitmap() external view returns (uint256)"
];

// Simulated contract (for testing without blockchain)
class BitmapSim {
  constructor() {
    this.bitmap = ethers.BigNumber.from(0);
  }

  storeValue(slot, value) {
    // Validate slot is within range
    if (slot >= 32) throw new Error("Slot must be 0-31");
    
    // Convert inputs to numbers for bit manipulation
    slot = Number(slot);
    value = Number(value);

    // Clear the existing value at the slot
    const mask = ethers.constants.MaxUint256.xor(
      ethers.BigNumber.from(0xFF).shl(slot * 8)
    );
    this.bitmap = this.bitmap.and(mask);

    // Store the new value
    this.bitmap = this.bitmap.or(ethers.BigNumber.from(value).shl(slot * 8));
    
    console.log(`Stored value ${value} in slot ${slot}`);
    return this.bitmap;
  }

  getValue(slot) {
    // Validate slot is within range
    if (slot >= 32) throw new Error("Slot must be 0-31");
    
    // Convert input to number for bit manipulation
    slot = Number(slot);
    
    // Extract the value
    const value = this.bitmap.shr(slot * 8).and(0xFF).toNumber();
    console.log(`Value at slot ${slot}: ${value}`);
    return value;
  }

  getAllValues() {
    const values = [];
    for (let i = 0; i < 32; i++) {
      values.push(this.bitmap.shr(i * 8).and(0xFF).toNumber());
    }
    console.log("All values:", values);
    return values;
  }

  getBitmap() {
    console.log("Complete bitmap:", this.bitmap.toHexString());
    return this.bitmap;
  }
}

async function runTests() {
  console.log("=== BITMAP CONTRACT TEST ===");
  
  const bitmap = new BitmapSim();
  
  console.log("\n=== Test 1: Store and retrieve single value ===");
  bitmap.storeValue(5, 123);
  const value5 = bitmap.getValue(5);
  console.assert(value5 === 123, `Expected 123 but got ${value5}`);
  
  console.log("\n=== Test 2: Store multiple values ===");
  bitmap.storeValue(0, 10);
  bitmap.storeValue(15, 127);
  bitmap.storeValue(31, 255);
  
  console.assert(bitmap.getValue(0) === 10, `Expected 10 at slot 0`);
  console.assert(bitmap.getValue(15) === 127, `Expected 127 at slot 15`);
  console.assert(bitmap.getValue(31) === 255, `Expected 255 at slot 31`);
  console.assert(bitmap.getValue(5) === 123, `Expected 123 at slot 5 (unchanged)`);
  
  console.log("\n=== Test 3: Get all values ===");
  const allValues = bitmap.getAllValues();
  console.assert(allValues[0] === 10, `Expected 10 at index 0`);
  console.assert(allValues[5] === 123, `Expected 123 at index 5`);
  console.assert(allValues[15] === 127, `Expected 127 at index 15`);
  console.assert(allValues[31] === 255, `Expected 255 at index 31`);
  
  console.log("\n=== Test 4: Overwrite value ===");
  bitmap.storeValue(15, 200);
  console.assert(bitmap.getValue(15) === 200, `Expected 200 at slot 15 after overwrite`);
  
  console.log("\n=== Test 5: Get full bitmap ===");
  const fullBitmap = bitmap.getBitmap();
  
  // Calculate expected bitmap
  // Values at: slot 0 = 10, slot 5 = 123, slot 15 = 200, slot 31 = 255
  const expected = ethers.BigNumber.from(10)
    .or(ethers.BigNumber.from(123).shl(5 * 8))
    .or(ethers.BigNumber.from(200).shl(15 * 8))
    .or(ethers.BigNumber.from(255).shl(31 * 8));
  
  console.log("Expected bitmap:", expected.toHexString());
  console.assert(fullBitmap.eq(expected), `Bitmap doesn't match expected value`);
  
  console.log("\n=== Test 6: Out of bounds handling ===");
  try {
    bitmap.storeValue(32, 100);
    console.log("❌ FAILED: Should have thrown error for slot 32");
  } catch (e) {
    console.log("✅ Correctly threw error for slot 32:", e.message);
  }
  
  console.log("\n=== ALL TESTS COMPLETED ===");
}

// Run the tests
runTests().catch(console.error); 