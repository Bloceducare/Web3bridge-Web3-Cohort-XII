// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./ERC20Token.sol";

error AlreadyClaimed(address claimant);
error InvalidProof(bytes32 leaf);
error TransferFailed(address recipient, uint256 amount);

contract MyAirdrop {
    ERC20Token public token;
    string public name;
    string public symbol;
    uint256 public initialSupply;
    bytes32 public merkleRoot;
    mapping(address => bool) public claimed;

    event Claimed(address indexed claimant, uint256 amount);

    constructor(
        bytes32 root,
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply
    ) {
        name = _name;
        symbol = _symbol;
        initialSupply = _initialSupply;
        token = new ERC20Token(name, symbol, initialSupply);
        merkleRoot = root;
    }

    function claim(uint256 amount, bytes32[] calldata merkleProof) external {
        if (claimed[msg.sender]) revert AlreadyClaimed(msg.sender);

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        if (!MerkleProof.verify(merkleProof, merkleRoot, leaf)) revert InvalidProof(leaf);
        if (token.transfer(msg.sender, amount) == false) revert TransferFailed(msg.sender, amount);

        claimed[msg.sender] = true;
        emit Claimed(msg.sender, amount);
    }

    function _balanceOf() public view returns (uint256) {
        return token.balanceOf(msg.sender);
    }
}
