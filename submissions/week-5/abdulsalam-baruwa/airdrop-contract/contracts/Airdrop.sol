// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./Token.sol";
error OnlyOwner();
error AlreadyClaimed();
error InvalidProof();

contract Airdrop {
    address private owner;
    Token public token;
    uint256 claimAmount;
    mapping(address => bool) public whiteListClaimed;
    bytes32 public whiteListMerkleRoot;

    event UpdatedMerkleRoot(bytes32 indexed newMerkleRoot);
    event Claim(address indexed account, uint256 amount);

    constructor(
        Token _token,
        bytes32 _whiteListMerkleRoot
    ) {
        owner = msg.sender;
        token = _token;
        whiteListMerkleRoot = _whiteListMerkleRoot;
        claimAmount = 100e18;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    function updateMerkleRoot(bytes32 _whiteListMerkleRoot) public onlyOwner {
        whiteListMerkleRoot = _whiteListMerkleRoot;
        emit UpdatedMerkleRoot(_whiteListMerkleRoot);
    }

    function claim(bytes32[] calldata _merkleProof) public {
        if (whiteListClaimed[msg.sender]) revert AlreadyClaimed();
        if (
            !MerkleProof.verify(
                _merkleProof,
                whiteListMerkleRoot,
                keccak256(abi.encodePacked(msg.sender))
            )
        ) {
            revert InvalidProof();
        }

        whiteListClaimed[msg.sender] = true;
        token.transfer(msg.sender, claimAmount);

        emit Claim(msg.sender, claimAmount);
    }
}
