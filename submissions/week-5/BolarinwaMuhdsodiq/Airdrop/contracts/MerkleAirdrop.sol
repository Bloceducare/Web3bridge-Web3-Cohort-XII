// SPDX-License-Identifier: MIT

pragma solidity 0.8.24;

import {IERC20, SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkelAirdrop {
    // useing erc
    using SafeERC20 for IERC20;

    error MerkelAirdrop_InvalidProof();
    error MerkelAirdrop_AlreadyClaimed();

    address[] claimer;
    bytes32 private immutable i_merkleRoot;
    IERC20 private immutable I_airdropTOken;

    mapping(address claimer => bool claimed) private s_hasClaimed;

    event Cliam(address, uint256);

    constructor(bytes32 markleRoot, IERC20 airdropToken) {
        i_merkleRoot = markleRoot;
        I_airdropTOken = airdropToken;
    }

    function claim(
        address account,
        uint256 amount,
        bytes32[] calldata merkleproof
    ) external {
        // calculate using the account and amount the hash -> leaf node
        // hashing twice incase their are similar words sceond premage attack
        if(s_hasClaimed[account]) {
            revert MerkelAirdrop_AlreadyClaimed(); 
        }
        bytes32 leaf = keccak256(abi.encodePacked(account, amount));

        if (!MerkleProof.verify(merkleproof, i_merkleRoot, leaf)) {
            revert MerkelAirdrop_InvalidProof();
        }

        s_hasClaimed[account] = true;
        emit Cliam(account, amount);
        I_airdropTOken.safeTransfer(account, amount);
        
    }

    function getMerkleRoot() external view returns(bytes32) {
        return i_merkleRoot;
    }

    function getAirdropToken() external view returns(IERC20) {
        return I_airdropTOken;
    }

    
}
