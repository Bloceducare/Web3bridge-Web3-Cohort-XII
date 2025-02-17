// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BAYCNFT is ERC721Enumerable, Ownable {
    uint256 public nextTokenId;
    string private baseTokenURI;

    constructor(string memory name, string memory symbol, string memory uri) ERC721(name, symbol) Ownable(msg.sender) {
        baseTokenURI = uri;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }

    function mint() external onlyOwner {
        _safeMint(msg.sender, nextTokenId);
        nextTokenId++;
    }
}
