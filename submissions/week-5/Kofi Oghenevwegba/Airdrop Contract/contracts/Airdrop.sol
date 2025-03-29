// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import './RetroFugazzi.sol';


contract MerkleAirdrop {
    address public owner;
    IERC20 public immutable tokenAddress;
    bytes32 public merkleRoot;
    
    mapping (address => bool) public claimed;

    event ClaimSuccessful(address, uint);
    constructor(address _tokenAddress, bytes32 _merkleRoot) {
        owner = msg.sender;
        tokenAddress = IERC20(_tokenAddress);
        merkleRoot = _merkleRoot;
    }

    function claim(address user_address, uint _amount, bytes32[] memory _proof) external {
        // check that users claim by themselves
        require(msg.sender == user_address, "Cant claim for others");
        // 
        require(!claimed[user_address], "already claimed");



        // compute leaf hash for provided address and amount
        bytes32 leaf = keccak256(abi.encodePacked(user_address, _amount));

        require(MerkleProof.verify(_proof, merkleRoot, leaf), "Invalid proof");

        claimed[user_address] = true;

        // transfer amount of token to user
        tokenAddress.transfer(user_address, _amount);

        emit ClaimSuccessful(user_address, _amount);
    }

    function onlyOwner() view private {
        require(msg.sender == owner, "unauthorized");
    }

    // function to update merkle root
    function updateMerkleRoot(bytes32 _merkleRoot) external {
        onlyOwner();
        merkleRoot = _merkleRoot;
    }

    function getContractBalance() external view returns (uint256) {
        return IERC20(tokenAddress).balanceOf(address(this));
    }
}