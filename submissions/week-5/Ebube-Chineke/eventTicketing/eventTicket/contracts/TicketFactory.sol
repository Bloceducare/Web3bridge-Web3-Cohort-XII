// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "./EbubeOnChainNFT.sol";

contract TicketFactory {
    event TicketContractCreated(address indexed eventOrganizer, address ticketContract);

    mapping(address => address[]) public organizerTickets;

    function createTicketContract(
        string memory _name,
        string memory _symbol
    ) external returns (address) {
        EbubeOnChainNFT newTicketContract = new EbubeOnChainNFT(_name, _symbol, msg.sender);
        address ticketAddress = address(newTicketContract);

        organizerTickets[msg.sender].push(ticketAddress);

        emit TicketContractCreated(msg.sender, ticketAddress);

        return ticketAddress;
    }
}
