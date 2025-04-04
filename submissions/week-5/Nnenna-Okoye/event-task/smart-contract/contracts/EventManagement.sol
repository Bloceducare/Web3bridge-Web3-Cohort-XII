// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import "./EventTicket.sol";

contract EventManagement {
    

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
        require(msg.sender != address(0), 'Caller is not authorized');
        require(startDate > block.timestamp, 'Start date must be set in the future');
        require(startDate < endDate, 'End date must be after the start date');

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
        require(msg.sender != address(0), 'Invalid address provided');
        
        EventDetails storage eventInstance = events[event_id];
        require(event_id <= event_count && event_id != 0, 'Event does not exist');
        require(eventInstance.endDate > block.timestamp, 'This event has already ended');
        require(eventInstance.registeredGuestCount < eventInstance.expectedGuestCount, 'Registration for this event is closed');
        require(hasRegistered[msg.sender][event_id] == false, 'You are already registered for this event');

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
        require(eventId <= event_count && eventId != 0, 'Event does not exist');
        EventDetails storage eventInstance = events[eventId];
        require(msg.sender == eventInstance.organizer, 'Only the event organizer can create this');
        require(eventInstance.ticketAddress == address(0), 'Tickets have already been created for this event');

        EventTicket newTicket = new EventTicket(address(this), ticketname, ticketSymbol);
        eventInstance.ticketAddress = address(newTicket);
    }

    // purchase ticket function
    function purchaseTicket(uint256 eventId) external payable {
        require(eventId <= event_count && eventId != 0, 'Event does not exist');
        EventDetails storage eventInstance = events[eventId];
        require(eventInstance.ticketAddress != address(0), 'No tickets available for this event');
        require(!hasRegistered[msg.sender][eventId], 'You have already purchased a ticket for this event');
        require(eventInstance.registeredGuestCount < eventInstance.expectedGuestCount, 'Tickets for this event are sold out');

         payable(eventInstance.organizer).transfer(msg.value);
      // Correct way to call mint function
    EventTicket ticketContract = EventTicket(eventInstance.ticketAddress);
    ticketContract.mint(msg.sender);

        eventInstance.registeredGuestCount++;
        hasRegistered[msg.sender][eventId] = true;
    }

    // verify attendance function
    function verifyAttendance(uint256 eventId, uint256 ticketId) external {
        require(eventId <= event_count && eventId != 0, 'Event does not exist');
        EventDetails storage eventInstance = events[eventId];
        require(msg.sender == eventInstance.organizer, 'Only the event organizer can verify attendance');
        require(!hasVerifiedAttendance[eventId][ticketId], 'Attendance for this ticket has already been verified');

        EventTicket ticketContract = EventTicket(eventInstance.ticketAddress);
        address ticketOwner = ticketContract.ownerOf(ticketId);
        require(hasRegistered[ticketOwner][eventId], 'This ticket is not registered for the event');

        hasVerifiedAttendance[eventId][ticketId] = true;
        eventInstance.verifiedGuestCount++;
    }
}
