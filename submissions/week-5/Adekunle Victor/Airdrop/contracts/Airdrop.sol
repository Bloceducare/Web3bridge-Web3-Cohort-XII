// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Airdrop {
    IERC20 public token;
    bytes32 public immutable merkleRoot;
    
    mapping(address => bool) public claimed;

    event Claim(address indexed claimer, uint256 amount);

    constructor(address _tokenAddress, bytes32 _merkleRoot) {
        token = IERC20(_tokenAddress);
        merkleRoot = _merkleRoot;
    }

    function claim(bytes32[] calldata proof) external {
        require(!claimed[msg.sender], "Airdrop: Already claimed");
        
        // Create leaf node from msg.sender
        bytes32 leaf = keccak256(abi.encode(msg.sender));
        
        require(
            MerkleProof.verify(proof, merkleRoot, leaf),
            "Airdrop: Invalid proof"
        );

        claimed[msg.sender] = true;

        uint256 amount = 100 * 1e18; // Fixed claim amount
        require(token.transfer(msg.sender, amount), "Airdrop: Transfer failed");

        emit Claim(msg.sender, amount);
    }

    // Helper function to verify merkle proof
    function verifyProof(bytes32[] calldata proof, address account) external view returns (bool) {
        bytes32 leaf = keccak256(abi.encode(account));
        return MerkleProof.verify(proof, merkleRoot, leaf);
    }
}