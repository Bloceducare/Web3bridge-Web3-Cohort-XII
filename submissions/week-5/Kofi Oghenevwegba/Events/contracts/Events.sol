// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import './Erc20.sol';
import './Nft.sol';

contract EventFactory {
    enum EventType { FREE, PAID }

    struct Event {
        string title;
        uint256 startDate;
        uint256 endDate;
        EventType eventType;
        uint256 maxCapacity;
        uint256 ticketCount;
        address organizer;
        address ticketNFT;
        address paymentToken;
        uint256 ticketPrice;
        bool active;
    }

    uint256 public eventCount;
    mapping(uint256 => Event) public events;
    mapping(address => mapping(uint256 => bool)) public hasTicket;

    event EventCreated(uint256 indexed eventId, string title, address ticketNFT);
    event TicketPurchased(uint256 indexed eventId, address indexed buyer);
    event AttendanceVerified(uint256 indexed eventId, address indexed attendee);

    function createEvent(
        string memory title,
        uint256 startDate,
        uint256 endDate,
        EventType eventType,
        uint256 maxCapacity,
        string memory ticketName,
        string memory ticketSymbol,
        address paymentToken,
        uint256 ticketPrice
    ) external returns (uint256) {
        require(startDate > block.timestamp, "Invalid start date");
        require(endDate > startDate, "Invalid end date");
        
        uint256 eventId = ++eventCount;
        
        // Deploy NFT contract for tickets
        OnChainNFT nftContract = new OnChainNFT(
            address(this),
            ticketName,
            ticketSymbol
        );

        events[eventId] = Event({
            title: title,
            startDate: startDate,
            endDate: endDate,
            eventType: eventType,
            maxCapacity: maxCapacity,
            ticketCount: 0,
            organizer: msg.sender,
            ticketNFT: address(nftContract),
            paymentToken: paymentToken,
            ticketPrice: ticketPrice,
            active: true
        });

        emit EventCreated(eventId, title, address(nftContract));
        return eventId;
    }

    function buyTicket(uint256 eventId) external {
        Event storage event_ = events[eventId];
        require(event_.active, "Event not active");
        require(block.timestamp < event_.startDate, "Event already started");
        require(event_.ticketCount < event_.maxCapacity, "Event full");
        require(!hasTicket[msg.sender][eventId], "Already has ticket");

        if (event_.eventType == EventType.PAID) {
            ERC20(event_.paymentToken).transferFrom(
                msg.sender,
                event_.organizer,
                event_.ticketPrice
            );
            OnChainNFT(event_.ticketNFT).mintPaidTicket(msg.sender);
        } else {
            OnChainNFT(event_.ticketNFT).mint(msg.sender);
        }

        event_.ticketCount++;
        hasTicket[msg.sender][eventId] = true;
        emit TicketPurchased(eventId, msg.sender);
    }

    function verifyAttendance(uint256 eventId, address attendee) external {
        Event storage event_ = events[eventId];
        require(msg.sender == event_.organizer, "Not organizer");
        require(hasTicket[attendee][eventId], "No ticket");
        require(block.timestamp >= event_.startDate, "Event not started");
        
        emit AttendanceVerified(eventId, attendee);
    }

    function getEvent(uint256 eventId) external view returns (Event memory) {
        return events[eventId];
    }
}