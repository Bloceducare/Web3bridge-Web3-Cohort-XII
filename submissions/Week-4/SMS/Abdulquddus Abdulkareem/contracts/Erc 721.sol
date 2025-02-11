// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.28;
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Erc721 is ERC721, Ownable {
     uint256 private nftId;
     constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) Ownable(msg.sender) {
     nftId =1;
     }

     function mintNFT(address receiver) external onlyOwner {
          _mint(receiver, nftId);
          nftId++;
     }

}