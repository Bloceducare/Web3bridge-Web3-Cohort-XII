// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "forge-std/Script.sol";
import "../src/TOKENSIGNER.sol";

contract SignMessageScript is Script {
    // Anvil accounts
    uint256 constant SIGNER_PRIVATE_KEY = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
    address constant SIGNER_ADDRESS = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;

    uint256 constant ATTACKER_PRIVATE_KEY = 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d;
    address constant ATTACKER_ADDRESS = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;

    function run() public {
        // Deploy the token
        vm.startBroadcast();
        TOKENSIGNER token = new TOKENSIGNER();
        console.log("Token deployed at:", address(token));

        // Test valid signature
        address recipient = SIGNER_ADDRESS;
        uint256 amount = 1000 * 10**18;
        
        // 1. Generate hash
        bytes32 messageHash = keccak256(abi.encodePacked(recipient, amount));
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        
        // 2. Sign message
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(SIGNER_PRIVATE_KEY, ethSignedMessageHash);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        // 3. Mint tokens with valid signature
        console.log("Attempting to mint with valid signature...");
        token.mintWithSignature(recipient, amount, signature);
        console.log("Tokens minted for:", recipient);
        console.log("Token balance:", token.balanceOf(recipient));
        
        // Test invalid signature - should fail
        console.log("\nAttempting to mint with wrong signer (should fail)...");
        try token.mintWithSignature(recipient, amount, abi.encodePacked(r, s, v+1)) {
            console.log("ERROR: Minting with wrong signature succeeded but should fail!");
        } catch Error(string memory reason) {
            console.log("Correctly failed with reason:", reason);
        }
        
        // Test minting for wrong address - should fail
        console.log("\nAttempting to mint for wrong address (should fail)...");
        address wrongRecipient = ATTACKER_ADDRESS;
        try token.mintWithSignature(wrongRecipient, amount, signature) {
            console.log("ERROR: Minting for wrong recipient succeeded but should fail!");
        } catch Error(string memory reason) {
            console.log("Correctly failed with reason:", reason);
        }
        
        vm.stopBroadcast();
    }
} 