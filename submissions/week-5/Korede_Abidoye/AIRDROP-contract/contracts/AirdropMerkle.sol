// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AirdropMerkle is Ownable {
    IERC20 public immutable token;
    bytes32 public merkleRoot;
    
    // Mapping to track which addresses have claimed their tokens
    mapping(address => bool) public hasClaimed;
    
    // Amount of tokens each address can claim
    mapping(address => uint256) public claimableAmounts;
    
    // Total amount of tokens allocated for the airdrop
    uint256 public totalAirdropAmount;
    
    event TokensClaimed(address indexed claimer, uint256 amount);
    
    constructor(address _token, bytes32 _merkleRoot, address[] memory addresses, uint256[] memory amounts) 
        Ownable(msg.sender) 
    {
        token = IERC20(_token);
        require(_merkleRoot != bytes32(0), "Invalid merkle root");
        require(addresses.length == amounts.length, "Mismatched arrays");
        
        merkleRoot = _merkleRoot;
        uint256 total = 0;
        
        for(uint256 i = 0; i < addresses.length; i++) {
            claimableAmounts[addresses[i]] = amounts[i];
            total += amounts[i];
        }
        
        totalAirdropAmount = total;
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
}