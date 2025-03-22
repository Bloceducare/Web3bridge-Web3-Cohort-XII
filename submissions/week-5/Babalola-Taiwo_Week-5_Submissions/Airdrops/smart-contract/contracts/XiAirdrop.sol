// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity 0.8.28;

import {IXiTK} from "./IXiTK.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract XiAirdrop is Ownable {
    bytes32 public merkleRoot;
    IXiTK public token;
    mapping(address => bool) public hasClaimed;

    error NOTWHITELISTED(address _address);

    event Claimed(address indexed _address, uint256 _value);
    event UpdatedMerkleRoot(bytes32 _merkleRoot);

    constructor(bytes32 _merkleRoot, address _tokenAddress) Ownable(msg.sender) {
        merkleRoot = _merkleRoot;
        token = IXiTK(_tokenAddress);
    }

    function claim(bytes32[] calldata proof, uint256 _value) public returns(bool) {
        require(!hasClaimed[msg.sender], "Already claimed");

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, _value)); // ✅ FIXED

        if (MerkleProof.verify(proof, merkleRoot, leaf)) {
            hasClaimed[msg.sender] = true; // ✅ FIXED: Set before minting
            require(token.mint(msg.sender, _value), "Mint failed");

            emit Claimed(msg.sender, _value);
            return true;
        } else {
            revert NOTWHITELISTED(msg.sender);
        }
    }

    function updateMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
        emit UpdatedMerkleRoot(_merkleRoot);
    }
}
