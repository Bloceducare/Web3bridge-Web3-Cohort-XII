// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract OnChainNFT is ERC721 {
    using Strings for uint256;

    uint256 private _tokenIdCounter; // Tracks the next token ID to mint
    mapping(uint256 => bool) public isPaidTicket; // Tracks whether a ticket is paid

    constructor(
        address _owner,
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {
        require(_owner != address(0), "Invalid owner address");
        _tokenIdCounter = 1; 
    }

    // Mint a generic ticket (used for free events)
    function mint(address to) public {
        uint256 tokenId = _tokenIdCounter;
        _safeMint(to, tokenId);
        isPaidTicket[tokenId] = false; 
        _tokenIdCounter++; 
    }

    // Mint a paid ticket with special metadata
    function mintPaidTicket(address to) public {
        uint256 tokenId = _tokenIdCounter;
        _safeMint(to, tokenId);
        isPaidTicket[tokenId] = true; 
        _tokenIdCounter++; 
    }

    // Generate tokenURI with dynamic metadata
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        ownerOf(tokenId); 

        string memory name = string(abi.encodePacked("OnChainNFT #", tokenId.toString()));
        string memory description = isPaidTicket[tokenId] 
            ? "This is a PAID on-chain NFT ticket." 
            : "This is a FREE on-chain NFT ticket.";
        string memory image = generateBase64Image();

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name":"', name, '",',
                        '"description":"', description, '",',
                        '"image":"data:image/svg+xml;base64,', image, '"}'
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    // Generate base64-encoded SVG image
    function generateBase64Image() internal pure returns (string memory) {
        string memory svg = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">'
                        '<rect width="200" height="200" fill="#6a11cb" />'
                        '<text x="100" y="100" text-anchor="middle" fill="white" font-size="24" font-family="Arial">Ticket</text>'
                        '</svg>';
        return Base64.encode(bytes(svg));
    }
}