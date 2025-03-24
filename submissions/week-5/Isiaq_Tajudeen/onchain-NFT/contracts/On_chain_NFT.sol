// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

// RandomColorNFT
contract On_chain_NFT is ERC721 {
    using EnumerableSet for EnumerableSet.UintSet;

    mapping(address => EnumerableSet.UintSet) tokensOwned;

    uint public counter;

    mapping(uint => string) public tokenIdToColor;

    error InvalidTokenId(uint tokenId);
    error OnlyOwner(address);

    constructor() ERC721("RandomColorNFT", "RCNFT") {}

    function mintTo(address _to) public {
        uint256 tokenId = counter++;

        _safeMint(_to, tokenId);

        tokenIdToColor[tokenId] = generateRandomColor();
    }

    struct TokenAndMetadata {
        uint tokenId;
        string metadata;
    }

    function getNftsOwned(
        address owner
    ) public view returns (TokenAndMetadata[] memory) {
        TokenAndMetadata[] memory tokens = new TokenAndMetadata[](
            tokensOwned[owner].length()
        );

        for (uint i = 0; i < tokensOwned[owner].length(); i++) {
            uint tokenId = tokensOwned[owner].at(i);
            tokens[i] = TokenAndMetadata(tokenId, tokenURI(tokenId));
        }

        return tokens;
    }

    function shuffleColor(uint _tokenId) public {
        if (_tokenId > counter) {
            revert InvalidTokenId(_tokenId);
        }

        if (ownerOf(_tokenId) != msg.sender) {
            revert OnlyOwner(msg.sender);
        }

        tokenIdToColor[_tokenId] = generateRandomColor();
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721) returns (address) {
        // Only remove the token if it is not being minted
        if (tokenId != counter) {
            tokensOwned[auth].remove(tokenId);
        }

        tokensOwned[to].add(tokenId);

        return super._update(to, tokenId, auth);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function tokenURI(
        uint _tokenId
    ) public view override returns (string memory) {
        if (_tokenId > counter) {
            revert InvalidTokenId(_tokenId);
        }

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        name(),
                        " #: ",
                        Strings.toString(_tokenId),
                        '","description": "Random colors are pretty or boring!", "image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(render(_tokenId))),
                        '"}'
                    )
                )
            )
        );

        return string(abi.encodePacked(_baseURI(), json));
    }

    function render(uint _tokenId) public view returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 1024'>",
                    "<rect width='1024' height='1024' fill='",
                    tokenIdToColor[_tokenId],
                    "' />",
                    "</svg>"
                )
            );
    }

    // Function to generate a random color hex code
    function generateRandomColor() public view returns (string memory) {
        // Generate a pseudo-random number using block.prevrandao
        uint256 randomNum = uint256(
            keccak256(
                abi.encodePacked(block.prevrandao, block.timestamp, msg.sender)
            )
        );

        // Extract RGB components from the random number
        bytes memory colorBytes = new bytes(3);
        colorBytes[0] = bytes1(uint8(randomNum >> 16));
        colorBytes[1] = bytes1(uint8(randomNum >> 8));
        colorBytes[2] = bytes1(uint8(randomNum));

        // Convert RGB components to hex string
        string memory colorHex = string(
            abi.encodePacked(
                "#",
                toHexDigit(uint8(colorBytes[0]) >> 4),
                toHexDigit(uint8(colorBytes[0]) & 0x0f),
                toHexDigit(uint8(colorBytes[1]) >> 4),
                toHexDigit(uint8(colorBytes[1]) & 0x0f),
                toHexDigit(uint8(colorBytes[2]) >> 4),
                toHexDigit(uint8(colorBytes[2]) & 0x0f)
            )
        );

        return colorHex;
    }

    // Helper function to convert a uint8 to a hex character
    function toHexDigit(uint8 d) internal pure returns (bytes1) {
        if (d < 10) {
            return bytes1(uint8(bytes1("0")) + d);
        } else {
            return bytes1(uint8(bytes1("a")) + d - 10);
        }
    }
}
