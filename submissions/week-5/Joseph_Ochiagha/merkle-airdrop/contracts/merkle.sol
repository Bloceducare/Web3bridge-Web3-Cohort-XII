// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MerkleAirdrop is Ownable, ReentrancyGuard {
    IERC20 public token;
    bytes32 public merkleRoot;

    // Mapping to track claimed airdrops
    mapping(address => bool) public hasClaimed;

    event AirdropClaimed(address indexed account, uint256 amount);
    event MerkleRootSet(bytes32 merkleRoot);

    constructor(address _token) Ownable(msg.sender) {
        token = IERC20(_token);
    }

    // Set the merkle root (only owner)
    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
        emit MerkleRootSet(_merkleRoot);
    }

    // Claim airdrop
    function claim(
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external nonReentrant {
        require(!hasClaimed[msg.sender], "Already claimed");
        require(merkleRoot != bytes32(0), "Merkle root not set");

        // Verify the merkle proof
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        require(
            MerkleProof.verify(merkleProof, merkleRoot, leaf),
            "Invalid proof"
        );

        // Mark as claimed and transfer tokens
        hasClaimed[msg.sender] = true;
        require(token.transfer(msg.sender, amount), "Transfer failed");

        emit AirdropClaimed(msg.sender, amount);
    }

    // Emergency withdraw (only owner)
    function withdrawTokens(address to, uint256 amount) external onlyOwner {
        require(token.transfer(to, amount), "Transfer failed");
    }
}
