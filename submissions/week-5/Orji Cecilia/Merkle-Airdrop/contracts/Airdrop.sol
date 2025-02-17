// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MerkleAirdrop is Ownable {
    IERC20 public immutable token;
    IERC721 public immutable baycNFT;
    bytes32 public merkleRoot;

    mapping(address => bool) public hasClaimed;

    event AirdropClaimed(address indexed user, uint256 amount);
    event MerkleRootUpdated(bytes32 newMerkleRoot);

    constructor(address _token, bytes32 _merkleRoot, address _baycNFT) Ownable(msg.sender) { 
        require(_token != address(0), "Invalid token address");
        require(_baycNFT != address(0), "Invalid BAYC NFT address");

        token = IERC20(_token);
        merkleRoot = _merkleRoot;
        baycNFT = IERC721(_baycNFT);
    }

    function claim(uint256 amount, bytes32[] calldata merkleProof) external {
        require(!hasClaimed[msg.sender], "Airdrop already claimed");
        require(baycNFT.balanceOf(msg.sender) > 0, "Must own a BAYC NFT");

        // Verify the Merkle proof
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        require(MerkleProof.verify(merkleProof, merkleRoot, leaf), "Invalid Merkle proof");

        // **Reentrancy protection: Mark before transferring tokens**
        hasClaimed[msg.sender] = true;

        // Transfer tokens
        require(token.transfer(msg.sender, amount), "Token transfer failed");

        emit AirdropClaimed(msg.sender, amount);
    }

    function updateMerkleRoot(bytes32 newMerkleRoot) external onlyOwner {
        require(newMerkleRoot != merkleRoot, "New Merkle root must be different");
        merkleRoot = newMerkleRoot;
        emit MerkleRootUpdated(newMerkleRoot);
    }

    function withdrawTokens(address recipient, uint256 amount) external onlyOwner {
        require(token.transfer(recipient, amount), "Withdraw failed");
    }
}
