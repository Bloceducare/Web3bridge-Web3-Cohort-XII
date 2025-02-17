// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Airdrop is Ownable {
    bytes32 public merkleRoot;
    IERC20 public immutable token;
    
    mapping(address => bool) public hasClaimed;

    error NOT_WHITELISTED(address _address);
    error ALREADY_CLAIMED(address _address);
    error TRANSFER_FAILED();

    event Claimed(address indexed _address, uint256 _value);
    event UpdatedMerkleRoot(bytes32 _merkleRoot);

    constructor(bytes32 _merkleRoot, address _tokenAddress) Ownable(msg.sender) {
        merkleRoot = _merkleRoot;
        token = IERC20(_tokenAddress);
    }

    function claim(bytes32[] calldata proof, uint256 _value) external {
        if (hasClaimed[msg.sender]) {
            revert ALREADY_CLAIMED(msg.sender);
        }

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, _value));
        if (!MerkleProof.verify(proof, merkleRoot, leaf)) {
            revert NOT_WHITELISTED(msg.sender);
        }

        hasClaimed[msg.sender] = true; // ✅ Update before transfer
        bool success = token.transfer(msg.sender, _value);
        if (!success) {
            revert TRANSFER_FAILED();
        }

        emit Claimed(msg.sender, _value);
    }

    function updateMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
        emit UpdatedMerkleRoot(_merkleRoot);
    }
}
