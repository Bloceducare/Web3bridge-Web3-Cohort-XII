// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract OurERC721 is ERC721, Ownable {
    uint256 private nft_id;
    mapping(address => uint256) nfts;

    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) Ownable(msg.sender) {
        nft_id += 1;
        _mint(msg.sender, nft_id);
    }

    // function _baseURI() internal view virtual override returns (string memory) {
    //     return "https://gateway.pinata.cloud/ipfs/bafkreiadfwfkrt2zz6ah2onhpcv6b3slm3346wgpwrnvhx3nfn3cpdzmti";
    // }

    function mint(address _to) public {
        nft_id += 1;
        _mint(_to, nft_id);
        nfts[_to] = nft_id;
    }

    function getId(address _address) public view returns(uint256){
        return nfts[_address];
    }
}
