// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ILTK} from "./ILTK.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";



contract Airdrop is Ownable {

    bytes32 public merkleRoot;
    ILTK token;
    mapping(address => bool) hasClaimed;

    error NOTWHITELISTED(address _address);

    event Claimed(address indexed _address, uint256 _value);
    event UpdatedMerkleRoot(bytes32 _merkleRoot);

    constructor(bytes32 _merkleRoot, address _tokenAddress) Ownable(msg.sender) {
        merkleRoot = _merkleRoot;
        token = ILTK(_tokenAddress);
    }

    function claim(bytes32[] calldata proof, uint256 _value) public returns(bool) {
        require(!hasClaimed[msg.sender], "Already claimed");

        bytes32 _leaf = keccak256(bytes.concat(keccak256(abi.encode(msg.sender, _value))));

        if(MerkleProof.verify(proof, merkleRoot, _leaf)){
            require(token.mint(msg.sender, _value), "Mint failed");
            hasClaimed[msg.sender] = true;
        }else{
            revert NOTWHITELISTED(msg.sender);
        }
        emit Claimed(msg.sender, _value);
        return true;
    }

    function updateMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
        emit UpdatedMerkleRoot(_merkleRoot);
    }
}