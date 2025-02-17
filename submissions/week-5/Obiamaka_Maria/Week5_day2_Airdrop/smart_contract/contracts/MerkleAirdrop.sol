// SPDX-License-Identifier: MIT 
pragma solidity 0.8.28;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MerkleAirdrop is Ownable {
    IERC20 public token;
    bytes32 public merkleRoot;
    mapping(address => bool) public hasClaimed;

    event TokensClaimed(address indexed claimant, uint256 amount);

    // Modify the constructor to call the Ownable constructor
    constructor(address _tokenAddress, bytes32 _merkleRoot) Ownable(msg.sender) {
        token = IERC20(_tokenAddress);
        merkleRoot = _merkleRoot;
    }

    function claimTokens(uint256 amount, bytes32[] calldata merkleProof) external {
        require(!hasClaimed[msg.sender], "Tokens already claimed!");

        // Compute leaf node
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));

        // Verify proof
        require(MerkleProof.verify(merkleProof, merkleRoot, leaf), "Invalid proof!");

        hasClaimed[msg.sender] = true;

        require(token.transfer(msg.sender, amount), "Token transfer failed!");
        emit TokensClaimed(msg.sender, amount);
    }

    function updateMerkleRoot(bytes32 newMerkleRoot) external onlyOwner {
        merkleRoot = newMerkleRoot;
    }
}
