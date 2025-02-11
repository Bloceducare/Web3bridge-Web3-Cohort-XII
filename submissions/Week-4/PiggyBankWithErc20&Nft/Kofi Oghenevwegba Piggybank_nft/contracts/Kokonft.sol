// SPDX-License-Identifier: UNLICENSED
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract SuspectNFT is ERC721, Ownable(msg.sender) {
    uint256 private _nextTokenId;

    constructor() ERC721("Ecstacy", "XTC") {
        _nextTokenId = 1;
    }
    function safeMint(address to) public returns (uint256) {
    uint256 tokenId = _nextTokenId++;
    _safeMint(to, tokenId);
    return tokenId;
    }

}
