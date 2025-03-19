// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import "./Erc721.sol";

contract EventContract {
    

    enum EventType { 
        free, 
        paid 
    }

    event EventCreated(uint256 id, address organizer);

    struct EventDetails {
        string title;
        string description;
        uint256 startDate;
        uint256 endDate;
        EventType eventType;
        uint32 expectedGuestCount;
        uint32 registeredGuestCount;
        uint32 verifiedGuestCount;
        address organizer;
        address ticketAddress;
    }

    uint256 public event_count;
    mapping(uint256 => EventDetails) public events;
    mapping(address => mapping(uint256 => bool)) public hasRegistered;
    mapping(uint256 => mapping(uint256 => bool)) public hasVerifiedAttendance;

    // createEvent function
    function createEvent(
        string memory title,
        string memory desc,
        uint256 startDate,
        uint256 endDate,
        EventType eventType,
        uint32 egc
    ) external {
        uint256 eventId = event_count + 1;
        require(msg.sender != address(0), 'UNAUTHORIZED CALLER');
        require(startDate > block.timestamp, 'START DATE MUST BE IN FUTURE');
        require(startDate < endDate, 'END-DATE MUST BE GREATER');

        EventDetails memory updatedEvent = EventDetails({
            title: title,
            description: desc,
            startDate: startDate,
            endDate: endDate,
            eventType: eventType,
            expectedGuestCount: egc,
            registeredGuestCount: 0,
            verifiedGuestCount: 0,
            organizer: msg.sender,
            ticketAddress: address(0)
        });

        events[eventId] = updatedEvent;
        event_count = eventId;
        emit EventCreated(eventId, msg.sender);
    }

    // registerForEvent function
    function registerForEvent(uint256 event_id) external {
        require(msg.sender != address(0), 'INVALID ADDRESS');
        
        EventDetails storage eventInstance = events[event_id];
        require(event_id <= event_count && event_id != 0, "EVENT DOES'NT EXIST");
        require(eventInstance.endDate > block.timestamp, 'EVENT HAS ENDED');
        require(eventInstance.registeredGuestCount < eventInstance.expectedGuestCount, 'REGISTRATION CLOSED');
        require(hasRegistered[msg.sender][event_id] == false, 'ALREADY REGISTERED');

        if (eventInstance.eventType == EventType.paid) {
            // mint ticket to user
            eventInstance.registeredGuestCount++;
            hasRegistered[msg.sender][event_id] = true;
        } else {
            eventInstance.registeredGuestCount++;
            hasRegistered[msg.sender][event_id] = true;
        }
    }

    // createEventTicket function
    function createEventTicket(
        uint256 eventId,
        string memory ticketname,
        string memory ticketSymbol
    ) external {
        require(eventId <= event_count && eventId != 0, "EVENT DOES'NT EXIST");
        EventDetails storage eventInstance = events[eventId];
        require(msg.sender == eventInstance.organizer, 'ONLY ORGANIZER CAN CREATE');
        require(eventInstance.ticketAddress == address(0), 'TICKET ALREADY CREATED');

        TicketNFT newTicket = new TicketNFT(address(this), ticketname, ticketSymbol);
        eventInstance.ticketAddress = address(newTicket);
    }

    // purchase ticket function
    function purchaseTicket(uint256 eventId) external payable {
        require(eventId <= event_count && eventId != 0, "EVENT DOES'NT EXIST");
        EventDetails storage eventInstance = events[eventId];
        require(eventInstance.ticketAddress != address(0), 'NO TICKETS AVAILABLE');
        require(!hasRegistered[msg.sender][eventId], 'ALREADY PURCHASED');
        require(eventInstance.registeredGuestCount < eventInstance.expectedGuestCount, 'SOLD OUT');

         payable(eventInstance.organizer).transfer(msg.value);
      // Correct way to call mint function
    TicketNFT ticketContract = TicketNFT(eventInstance.ticketAddress);
    ticketContract.mint(msg.sender);

        eventInstance.registeredGuestCount++;
        hasRegistered[msg.sender][eventId] = true;
    }

    // verify attendance function
    function verifyAttendance(uint256 eventId, uint256 ticketId) external {
        require(eventId <= event_count && eventId != 0, "EVENT DOES'NT EXIST");
        EventDetails storage eventInstance = events[eventId];
        require(msg.sender == eventInstance.organizer, 'ONLY ORGANIZER CAN VERIFY');
        require(!hasVerifiedAttendance[eventId][ticketId], 'ALREADY VERIFIED');

        TicketNFT ticketContract = TicketNFT(eventInstance.ticketAddress);
        address ticketOwner = ticketContract.ownerOf(ticketId);
        require(hasRegistered[ticketOwner][eventId], 'TICKET NOT REGISTERED');

        hasVerifiedAttendance[eventId][ticketId] = true;
        eventInstance.verifiedGuestCount++;
    }
}

