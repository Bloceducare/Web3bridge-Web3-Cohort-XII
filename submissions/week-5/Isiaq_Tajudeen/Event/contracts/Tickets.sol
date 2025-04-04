// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Tickets is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    string private ticketUri;

    constructor(
        address _initialOwner,
        string memory _uri,
        string memory _ticketName,
        string memory _ticketSymbol
    ) ERC721(_ticketName, _ticketSymbol) Ownable(_initialOwner) {
        ticketUri = _uri;
    }

    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _nextTokenId++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, ticketUri);
    }

    // The following functions are overrides required by Solidity.
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
