// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC721Mock is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    address public minter;

    constructor(string memory name, string memory symbol, address initialOwner) ERC721(name, symbol) Ownable(initialOwner) {}

    function setMinter(address _minter) external onlyOwner {
        minter = _minter;
    }

    function mint(address to) external {
        require(msg.sender == minter, "Unauthorized: Only AJO can mint");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(to, tokenId); // ✅ Mint without metadata
    }
}
