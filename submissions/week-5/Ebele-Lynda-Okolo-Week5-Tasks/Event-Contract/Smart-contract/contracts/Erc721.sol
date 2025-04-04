// SPDX-License-Identifier: MIT 

pragma solidity 0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract TicketNFT is ERC721, Ownable{

    uint256 public nftCount;
    address private  eventContract;

    constructor(address _eventContract, string memory _name, string memory _symbol) ERC721(_name, _symbol) Ownable(msg.sender) {
        nftCount = 1;
       _eventContract = eventContract;

    }

    function mint(address _to) public onlyOwner {
        uint256 tokenId = nftCount;

        _safeMint(_to, tokenId);

        nftCount += 1;
    }

}