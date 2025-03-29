const ethers = require('ethers');

// Function to simulate the contract's verification logic
function simulateContractVerification(signerAddress, amount, signature) {
  // Create the message hash (same as in the contract)
  const messageHash = ethers.utils.solidityKeccak256(
    ['address', 'uint256'],
    [signerAddress, amount]
  );
  
  // Create the Ethereum signed message hash (same as in the contract)
  const ethSignedMessageHash = ethers.utils.solidityKeccak256(
    ['string', 'bytes32'],
    ['\x19Ethereum Signed Message:\n32', messageHash]
  );
  
  // Recover the signer from the signature
  const recoveredAddress = ethers.utils.recoverAddress(ethSignedMessageHash, signature);
  
  // Verify that the recovered address matches the expected signer
  if (recoveredAddress.toLowerCase() !== signerAddress.toLowerCase()) {
    throw new Error("NOMINT: Invalid signature");
  }
  
  return true;
}

async function runTests() {
  console.log("=== TOKENSIGNER CONTRACT TEST ===");
  
  // Create a wallet representing our signer
  const signerWallet = ethers.Wallet.createRandom();
  console.log(`Signer Address: ${signerWallet.address}`);
  
  // Create a wallet representing an attacker
  const attackerWallet = ethers.Wallet.createRandom();
  console.log(`Attacker Address: ${attackerWallet.address}`);
  
  // Define the amount to mint
  const amountToMint = ethers.utils.parseEther("1000");
  console.log(`Amount to mint: ${ethers.utils.formatEther(amountToMint)} tokens`);
  
  // TEST 1: Valid signature
  console.log("\n=== TEST 1: Valid Signature ===");
  try {
    // Create message hash
    const messageHash = ethers.utils.solidityKeccak256(
      ['address', 'uint256'],
      [signerWallet.address, amountToMint]
    );
    
    // Sign the message hash with the correct private key
    const signature = await signerWallet.signMessage(ethers.utils.arrayify(messageHash));
    console.log(`Generated signature: ${signature}`);
    
    // Verify the signature in our simulated contract
    const result = simulateContractVerification(signerWallet.address, amountToMint, signature);
    console.log("✅ Test passed: Valid signature was accepted");
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
  
  // TEST 2: Invalid signature (wrong signer)
  console.log("\n=== TEST 2: Invalid Signature (Wrong Signer) ===");
  try {
    // Create message hash
    const messageHash = ethers.utils.solidityKeccak256(
      ['address', 'uint256'],
      [signerWallet.address, amountToMint]
    );
    
    // Sign with the WRONG private key (attacker's key)
    const wrongSignature = await attackerWallet.signMessage(ethers.utils.arrayify(messageHash));
    console.log(`Generated wrong signature: ${wrongSignature}`);
    
    // This should fail
    const result = simulateContractVerification(signerWallet.address, amountToMint, wrongSignature);
    console.log("❌ Test failed: Invalid signature was accepted");
  } catch (error) {
    console.log(`✅ Test passed: ${error.message}`);
  }
  
  // TEST 3: Cannot mint for others
  console.log("\n=== TEST 3: Cannot Mint For Others ===");
  try {
    // Create message hash for attacker's address
    const messageHash = ethers.utils.solidityKeccak256(
      ['address', 'uint256'],
      [attackerWallet.address, amountToMint]
    );
    
    // Sign with signer's key, but for attacker's address
    const signature = await signerWallet.signMessage(ethers.utils.arrayify(messageHash));
    console.log(`Generated signature: ${signature}`);
    
    // This should fail because the signature is valid, but the signer doesn't match the recipient
    const result = simulateContractVerification(attackerWallet.address, amountToMint, signature);
    console.log("❌ Test failed: Attacker was able to mint tokens");
  } catch (error) {
    console.log(`✅ Test passed: ${error.message}`);
  }
  
  console.log("\n=== TESTS COMPLETE ===");
}

// Run the tests
runTests().catch(console.error); 