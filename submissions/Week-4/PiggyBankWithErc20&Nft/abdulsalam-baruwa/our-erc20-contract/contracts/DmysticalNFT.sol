// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {ERC721URIStorage, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract DmysticalNFT is ERC721URIStorage, Ownable {
   uint256 private _nextTokenId;
    mapping(address => uint256) nfts;

    constructor() ERC721("DmysticalNFT", "DNFT") Ownable(msg.sender) {}

    function awardNft(address contributor) public returns (uint256) {
        uint256 tokenId = _nextTokenId + 1;
        _mint(contributor, tokenId);
        _setTokenURI(tokenId, "https://gateway.pinata.cloud/ipfs/bafkreiadfwfkrt2zz6ah2onhpcv6b3slm3346wgpwrnvhx3nfn3cpdzmti");
        return tokenId;
    }

    function getId(address _address) public view returns(uint256){
        return nfts[_address];
    }
}