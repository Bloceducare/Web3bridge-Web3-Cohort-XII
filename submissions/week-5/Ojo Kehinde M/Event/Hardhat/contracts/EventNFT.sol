// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Tickets is ERC721URIStorage, Ownable {
    using Strings for uint256;

    uint256 private _tokenIdCounter;
    address private _eventContract;

    constructor(address eventContract, string memory name, string memory symbol)
        ERC721(name, symbol)
        Ownable(msg.sender)
    {
        _eventContract = eventContract;
    }

    modifier onlyEventContract() {
        require(msg.sender == _eventContract, "Caller is not the event contract");
        _;
    }

    function mintTicket(address to) external onlyEventContract {
        _tokenIdCounter++;
        uint256 newTicketId = _tokenIdCounter;
        _safeMint(to, newTicketId);
        _setTokenURI(newTicketId, generateTokenURI(newTicketId));
    }

    function generateTokenURI(uint256 tokenId) internal pure returns (string memory) {
        string memory name = string(abi.encodePacked("Event Ticket #", tokenId.toString()));
        string memory description = "Exclusive NFT Ticket for a special event.";
        string memory image = generateImage(tokenId);

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "', name, '",',
                        '"description": "', description, '",',
                        '"image": "data:image/svg+xml;base64,', image, '"}'
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function generateImage(uint256 ticketNumber) internal pure returns (string memory) {
        string memory svg = string(
            abi.encodePacked(
                "<svg width='300' height='200' xmlns='http://www.w3.org/2000/svg'>",
                "<rect width='100%' height='100%' fill='black' stroke='gold' stroke-width='5' rx='15'/>",
                "<text x='50%' y='30%' font-size='18' fill='gold' text-anchor='middle'>Event Name</text>",
                "<text x='50%' y='60%' font-size='22' fill='white' font-weight='bold' text-anchor='middle'>TICKET #",
                ticketNumber.toString(),
                "</text>",
                "<text x='50%' y='80%' font-size='14' fill='gray' text-anchor='middle'>Valid for one entry</text>",
                "</svg>"
            )
        );

        return Base64.encode(bytes(svg));
    }
}
