// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VotingNFT is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    mapping(address => bool) public hasNFT;

    constructor(string memory _pollName) ERC721(_pollName, "VNFT") {}

    function mintNFT(address voter) external onlyOwner {
        require(!hasNFT[voter], "Voter already has an NFT for this election");
        _tokenIdCounter++;
        _safeMint(voter, _tokenIdCounter);
        hasNFT[voter] = true;
    }
}
