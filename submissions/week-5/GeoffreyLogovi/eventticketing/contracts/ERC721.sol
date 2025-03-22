// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract OurERC721 is ERC721, Ownable {
    uint256 private nft_id;
    mapping(uint256 => uint256) public ticketToEvent; // Mapping NFT ID to Event ID
    mapping(uint256 => bool) public verifiedTickets; // Track verified tickets

    event TicketMinted(
        address indexed owner,
        uint256 indexed tokenId,
        uint256 eventId
    );
    event TicketVerified(
        address indexed owner,
        uint256 indexed tokenId,
        uint256 eventId
    );

    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) Ownable(msg.sender) {}

    function mint(address _to, uint256 _eventId) public onlyOwner {
        nft_id += 1;
        _mint(_to, nft_id);
        ticketToEvent[nft_id] = _eventId;
        emit TicketMinted(_to, nft_id, _eventId);
    }

    function verifyTicket(
        uint256 _tokenId,
        uint256 _eventId
    ) public returns (bool) {
        require(ownerOf(_tokenId) != address(0), "Ticket does not exist"); // Check if token exists
        require(
            ticketToEvent[_tokenId] == _eventId,
            "Invalid event for this ticket"
        );
        require(!verifiedTickets[_tokenId], "Ticket already verified");

        verifiedTickets[_tokenId] = true;
        emit TicketVerified(ownerOf(_tokenId), _tokenId, _eventId);
        return true;
    }
}
