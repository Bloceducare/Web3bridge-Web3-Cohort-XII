// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MerkleAirdrop is Ownable {
    IERC20 public immutable token;
    bytes32 public immutable merkleRoot;
    uint256 public fixedAmount = 1000 * 10**18;
    mapping(address => bool) public hasClaimed;

    event AirdropClaimed(address indexed claimant, uint256 amount);

    constructor(address _token, address _owner, bytes32 _merkleRoot) Ownable(_owner) {
        token = IERC20(_token);
        merkleRoot = _merkleRoot;
    }

    function claim(bytes32[] calldata merkleProof) external {
        require(!hasClaimed[msg.sender], "Airdrop already claimed");

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, fixedAmount));
        require(MerkleProof.verify(merkleProof, merkleRoot, leaf), "Invalid proof");

        hasClaimed[msg.sender] = true;

        require(token.transfer(msg.sender, fixedAmount), "Token transfer failed");

        emit AirdropClaimed(msg.sender, fixedAmount);
    }
}
