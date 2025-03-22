// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Tickets is ERC721, Ownable {
    uint256 private _ticketCounter;
    address private organizerContract;

    constructor(
        address _organizer,
        string memory ticketName,
        string memory ticketSymbol
    ) ERC721(ticketName, ticketSymbol) Ownable(_organizer) {
        organizerContract = _organizer;
    }

    modifier onlyOrganizer() {
        require(msg.sender == organizerContract, "Caller is not the organizer contract");
        _;
    }

    function safeMint(address attendee) external onlyOrganizer {
        _ticketCounter++;
        _safeMint(attendee, _ticketCounter); // Mint the NFT ticket for the attendee
    }
}