//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract YosemiteNft is ERC721 {
    uint256 private _tokenIdCounter;

    constructor() ERC721("YosemiteNft", "YNFT") {} 

    function mint() public {
        _safeMint(msg.sender, _tokenIdCounter);
        _tokenIdCounter++;
    }

    function tokenURI(uint256 tokenId) public pure override returns (string memory) {
        require(tokenId == 0, "Token ID does not exist");
        
    string memory svg = 
        "<svg xmlns='http://www.w3.org/2000/svg' width='500' height='500' viewBox='0 0 500 500'>"
        "<!-- Background Gradient -->"
        "<defs>"
        "<linearGradient id='sky' x1='0' y1='0' x2='0' y2='1'>"
        "<stop offset='0%' stop-color='#87CEEB' />"
        "<stop offset='100%' stop-color='#1E90FF' />"
        "</linearGradient>"
        "<linearGradient id='mountains' x1='0' y1='0' x2='0' y2='1'>"
        "<stop offset='0%' stop-color='#708090' />"
        "<stop offset='100%' stop-color='#2F4F4F' />"
        "</linearGradient>"
        "<linearGradient id='sun' x1='0' y1='0' x2='0' y2='1'>"
        "<stop offset='0%' stop-color='#FFD700' />"
        "<stop offset='100%' stop-color='#FFA500' />"
        "</linearGradient>"
        "</defs>"

        "<!-- Sky -->"
        "<rect width='100%' height='100%' fill='url(#sky)' />"

        "<!-- Sun -->"
        "<circle cx='250' cy='100' r='50' fill='url(#sun)' />"

        "<!-- Mountains -->"
        "<polygon points='0,500 150,200 300,500' fill='url(#mountains)' />"
        "<polygon points='200,500 350,250 500,500' fill='url(#mountains)' />"

        "<!-- Trees -->"
        "<rect x='50' y='400' width='20' height='100' fill='#8B4513' />"
        "<polygon points='30,400 90,400 60,350' fill='#228B22' />"
        "<polygon points='30,370 90,370 60,320' fill='#228B22' />"
        "<polygon points='30,340 90,340 60,290' fill='#228B22' />"

        "<rect x='400' y='400' width='20' height='100' fill='#8B4513' />"
        "<polygon points='380,400 440,400 410,350' fill='#228B22' />"
        "<polygon points='380,370 440,370 410,320' fill='#228B22' />"
        "<polygon points='380,340 440,340 410,290' fill='#228B22' />"

        "<!-- Text -->"
        "<text x='50%' y='90%' font-size='30' text-anchor='middle' fill='#FFFFFF' font-family='Arial, sans-serif' font-weight='bold'>"
        "Yosemite On-Chain NFT"
        "</text>"
        "<text x='50%' y='95%' font-size='20' text-anchor='middle' fill='#FFFFFF' font-family='Arial, sans-serif'>"
        "Exploring the Wild"
        "</text>"
    "</svg>";

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "On-Chain NFT", "description": "An NFT stored entirely on-chain.", "image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(svg)),
                        '"}'
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }
}