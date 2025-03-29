// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract Ticket is ERC721URIStorage, Ownable {
    uint256 private tokenId;

    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) Ownable(msg.sender) {}

    function mintNFT(address recipient, string memory metadataName, string memory desc, string memory imageURI) external onlyOwner returns(uint256) {
      uint256 newTokenId = tokenId + 1;
      tokenId = newTokenId;

      string memory json = Base64.encode(bytes(string(abi.encodePacked('{"name": "', metadataName,'", "description": "', desc,'", "image": "data:image/svg+xml;base64,',Base64.encode(bytes(imageURI)),'"}'))));
      _safeMint(recipient, newTokenId);
      _setTokenURI(newTokenId, string(abi.encodePacked("data:application/json;base64,", json)));
      
      return newTokenId;
    }

    function getTokenId() external view returns(uint256) {
      return tokenId;
    }
}