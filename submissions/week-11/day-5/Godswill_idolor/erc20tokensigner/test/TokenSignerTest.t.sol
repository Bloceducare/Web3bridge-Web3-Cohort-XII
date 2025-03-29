// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.10;

import "forge-std/Test.sol";
import "../src/TOKENSIGNER.sol";

contract TokenSignerTest is Test {
    TOKENSIGNER public tokenSigner;
    
    // First Anvil account
    uint256 constant signerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
    address constant signerAddress = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    
    // Second Anvil account
    uint256 constant attackerPrivateKey = 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d;
    address constant attackerAddress = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;

    function setUp() public {
        // Deploy the token contract
        tokenSigner = new TOKENSIGNER();
    }

    function testValidSignature() public {
        // Prepare mint parameters
        address recipient = signerAddress;
        uint256 amount = 1000 * 10**18; // 1000 tokens
        
        // Create the message hash that needs to be signed
        bytes32 messageHash = keccak256(abi.encodePacked(recipient, amount));
        
        // Sign the message hash with the correct private key (the recipient's key)
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPrivateKey, ethSignedMessageHash);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        // Mint tokens with the valid signature
        tokenSigner.mintWithSignature(recipient, amount, signature);
        
        // Assert that tokens were minted successfully
        assertEq(tokenSigner.balanceOf(recipient), amount, "Tokens should be minted with valid signature");
    }

    function testInvalidSignature() public {
        // Prepare mint parameters
        address recipient = signerAddress;
        uint256 amount = 1000 * 10**18; // 1000 tokens
        
        // Create the message hash
        bytes32 messageHash = keccak256(abi.encodePacked(recipient, amount));
        
        // Sign with WRONG private key (attacker's key)
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(attackerPrivateKey, ethSignedMessageHash);
        bytes memory wrongSignature = abi.encodePacked(r, s, v);
        
        // Expect the transaction to revert with the error message "NOMINT"
        vm.expectRevert("NOMINT");
        tokenSigner.mintWithSignature(recipient, amount, wrongSignature);
        
        // Assert that no tokens were minted
        assertEq(tokenSigner.balanceOf(recipient), 0, "No tokens should be minted with invalid signature");
    }

    function testCannotMintForOthers() public {
        // Prepare mint parameters for attacker trying to mint for themselves using signer's signature
        address recipient = attackerAddress;
        uint256 amount = 1000 * 10**18;
        
        // Create the message hash for the attacker
        bytes32 messageHash = keccak256(abi.encodePacked(recipient, amount));
        
        // Sign with signer's private key, but for attacker's address
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPrivateKey, ethSignedMessageHash);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        // Expect revert because the signature is valid, but the verification checks that 
        // the recovered signer matches the recipient
        vm.expectRevert("NOMINT");
        tokenSigner.mintWithSignature(recipient, amount, signature);
        
        // Assert no tokens were minted
        assertEq(tokenSigner.balanceOf(recipient), 0, "No tokens should be minted for others");
    }
} 