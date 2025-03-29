// Usage example for the Bitmap contract
const { ethers } = require('ethers');

/**
 * Example: Using a bitmap for character attributes in a game
 * 
 * - Bits 0-7 (slot 0): Player strength (0-255)
 * - Bits 8-15 (slot 1): Player dexterity (0-255)
 * - Bits 16-23 (slot 2): Player intelligence (0-255)
 * - Bits 24-31 (slot 3): Player wisdom (0-255)
 * - Bits 32-39 (slot 4): Player charisma (0-255)
 * - Bits 40-47 (slot 5): Player constitution (0-255)
 * - Bits 48-55 (slot 6): Player level (0-255)
 * - Bits 56-63 (slot 7): Player class ID (0-255)
 */

class CharacterAttributes {
  constructor() {
    this.bitmap = ethers.BigNumber.from(0);
  }

  // Set character attribute
  setAttribute(attributeSlot, value) {
    if (attributeSlot >= 32) throw new Error("Attribute slot must be 0-31");
    if (value > 255) throw new Error("Attribute value must be 0-255");
    
    // Clear the existing attribute value
    const mask = ethers.constants.MaxUint256.xor(
      ethers.BigNumber.from(0xFF).shl(attributeSlot * 8)
    );
    this.bitmap = this.bitmap.and(mask);
    
    // Set the new attribute value
    this.bitmap = this.bitmap.or(ethers.BigNumber.from(value).shl(attributeSlot * 8));
    
    return this.bitmap;
  }

  // Get character attribute
  getAttribute(attributeSlot) {
    if (attributeSlot >= 32) throw new Error("Attribute slot must be 0-31");
    return this.bitmap.shr(attributeSlot * 8).and(0xFF).toNumber();
  }

  // Get all attributes as an object
  getAllAttributes() {
    return {
      strength: this.getAttribute(0),
      dexterity: this.getAttribute(1),
      intelligence: this.getAttribute(2),
      wisdom: this.getAttribute(3),
      charisma: this.getAttribute(4),
      constitution: this.getAttribute(5),
      level: this.getAttribute(6),
      classId: this.getAttribute(7)
    };
  }

  // Save character data (this would be stored on-chain in the contract)
  getCharacterData() {
    return this.bitmap.toHexString();
  }

  // Load character data from hex string (e.g., when loading from blockchain)
  loadCharacterData(hexData) {
    this.bitmap = ethers.BigNumber.from(hexData);
  }
}

// Example usage
function runExample() {
  console.log("=== CHARACTER ATTRIBUTES EXAMPLE ===");
  
  // Create a new character
  const character = new CharacterAttributes();
  
  // Set character attributes
  character.setAttribute(0, 18);  // Strength: 18
  character.setAttribute(1, 14);  // Dexterity: 14
  character.setAttribute(2, 16);  // Intelligence: 16
  character.setAttribute(3, 12);  // Wisdom: 12
  character.setAttribute(4, 15);  // Charisma: 15
  character.setAttribute(5, 13);  // Constitution: 13
  character.setAttribute(6, 5);   // Level: 5
  character.setAttribute(7, 2);   // Class ID: 2 (e.g., Wizard)
  
  // Get individual attribute
  console.log("Character strength:", character.getAttribute(0));
  console.log("Character level:", character.getAttribute(6));
  
  // Get all attributes
  console.log("\nAll character attributes:", character.getAllAttributes());
  
  // Save character data (e.g., to blockchain)
  const savedData = character.getCharacterData();
  console.log("\nSaved character data:", savedData);
  
  // Create a new character and load the saved data
  const loadedCharacter = new CharacterAttributes();
  loadedCharacter.loadCharacterData(savedData);
  
  // Verify the loaded character has the same attributes
  console.log("\nLoaded character attributes:", loadedCharacter.getAllAttributes());
  
  // Update a single attribute (level up!)
  loadedCharacter.setAttribute(6, 6);  // Level: 6
  console.log("\nAfter level up:", loadedCharacter.getAllAttributes());
  
  // Calculate storage savings
  console.log("\nStorage comparison:");
  console.log("- Using bitmap: 32 bytes (1 uint256)");
  console.log("- Using separate variables: 256 bytes (8 uint32 variables)");
  console.log("- Storage reduction: 87.5%");
}

// Run the example
runExample(); 