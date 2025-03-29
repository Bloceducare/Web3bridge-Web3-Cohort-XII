// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AirdropMerkle is Ownable {
    IERC20 public token;
    bytes32 public merkleRoot;
    
    // Mapping to track which addresses have claimed their tokens
    mapping(address => bool) public hasClaimed;
    
    // Amount of tokens each address can claim
    mapping(address => uint256) public claimableAmounts;
    
    // Total amount of tokens allocated for the airdrop
    uint256 public totalAirdropAmount;
    
    event TokensClaimed(address indexed claimer, uint256 amount);
    event AirdropInitialized(bytes32 merkleRoot, uint256 totalAmount);
    
    constructor(address _token) Ownable(msg.sender) {
        token = IERC20(_token);
    }
    
    // Function to set up the airdrop with Merkle root and amounts
    function initializeAirdrop(
        bytes32 _merkleRoot,
        address[] calldata addresses,
        uint256[] calldata amounts
    ) external onlyOwner {
        require(_merkleRoot != bytes32(0), "Invalid merkle root");
        require(addresses.length == amounts.length, "Mismatched arrays");
        require(merkleRoot == bytes32(0), "Airdrop already initialized");
        
        merkleRoot = _merkleRoot;
        uint256 total = 0;
        
        for(uint256 i = 0; i < addresses.length; i++) {
            claimableAmounts[addresses[i]] = amounts[i];
            total += amounts[i];
        }
        
        totalAirdropAmount = total;
        emit AirdropInitialized(_merkleRoot, total);
    }
    
    // Function to check if an address is whitelisted
    function isWhitelisted(
        address account,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) public view returns (bool) {
        // Create leaf node by hashing the account and amount
        bytes32 leaf = keccak256(
            bytes.concat(keccak256(abi.encode(account, amount)))
        );
        
        // Verify the Merkle proof
        return MerkleProof.verify(merkleProof, merkleRoot, leaf);
    }
    
    // Function to claim tokens
    function claim(
        address account,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external {
        require(merkleRoot != bytes32(0), "Airdrop not initialized");
        require(!hasClaimed[account], "Already claimed");
        require(amount == claimableAmounts[account], "Invalid claim amount");
        
        // Verify the Merkle proof
        require(
            isWhitelisted(account, amount, merkleProof),
            "Invalid proof: Not whitelisted"
        );
        
        // Mark as claimed
        hasClaimed[account] = true;
        
        // Transfer tokens
        require(
            token.transfer(account, amount),
            "Token transfer failed"
        );
        
        emit TokensClaimed(account, amount);
    }
    
    // Function to withdraw remaining tokens (emergency)
    function withdrawRemainingTokens() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        require(token.transfer(owner(), balance), "Token transfer failed");
    }
    
    // Function to update Merkle root (emergency)
    function updateMerkleRoot(bytes32 _newMerkleRoot) external onlyOwner {
        require(_newMerkleRoot != bytes32(0), "Invalid merkle root");
        merkleRoot = _newMerkleRoot;
    }
}