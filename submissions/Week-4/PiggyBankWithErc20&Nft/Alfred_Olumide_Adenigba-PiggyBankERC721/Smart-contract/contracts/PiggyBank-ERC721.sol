// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PiggyBankNFT is ERC721Enumerable, Ownable {
    uint256 private _tokenIds;
    mapping(address => uint256) nfts;

    // Pass msg.sender to Ownable()
    constructor( string memory name, string memory symbol ) ERC721(name, symbol) Ownable(msg.sender) {}

    function mintNFT(address recipient) public returns (uint256) {
        _tokenIds += 1;
        _safeMint(recipient, _tokenIds);
        nfts[recipient] = _tokenIds;
        return _tokenIds;
    }

    function getId(address recipient) public view returns (uint256) {
        return nfts[recipient];
    }
}