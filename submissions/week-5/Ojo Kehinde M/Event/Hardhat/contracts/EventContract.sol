//SPDX-License-Identifier: UNLICENSE
pragma solidity 0.8.28;

import "./EventNFT.sol";

contract EventContract {
    enum EventType {
        free,
        paid
    }

    struct EventDetails {
        string _title;
        string _description;
        uint256 _startDate;
        uint256 _endDate;
        EventType _type;
        uint32 _expectedGuestCount;
        uint32 _registeredGuestCount;
        uint32 _verifiedGuestCount;
        uint256 _ticketPrice;
        address _organizer;
        address _ticketAddress;
    }

    uint256 public event_count;
    mapping(uint256 => EventDetails) public events;
    mapping(address => mapping(uint256 => bool)) public hasRegistered;
    mapping(uint256 => mapping(address => bool)) public isAttendeeConfirmed;

    // Create Event
    function createEvent(
        string memory _title,
        string memory _description,
        uint256 _startDate,
        uint256 _endDate,
        EventType _type,
        uint32 _egc,
        uint256 _ticketPrice
    ) external {
        require(msg.sender != address(0), "Invalid Address");
        require(
            _startDate > block.timestamp,
            "Start Date must be in the Future"
        );
        require(_startDate < _endDate, "End Date must be Greater");

        event_count++;
        uint256 eventId = event_count;

        events[eventId] = EventDetails({
            _title: _title,
            _description: _description,
            _startDate: _startDate,
            _endDate: _endDate,
            _type: _type,
            _expectedGuestCount: _egc,
            _registeredGuestCount: 0,
            _verifiedGuestCount: 0,
            _ticketPrice: _type == EventType.paid ? _ticketPrice : 0,
            _organizer: msg.sender,
            _ticketAddress: address(0)
        });
    }

    // Register & Purchase Ticket
    function registerForEvent(uint256 eventId) external payable {
        require(msg.sender != address(0), "Invalid Address");
        require(eventId > 0 && eventId <= event_count, "Event doesn't Exist");

        EventDetails storage _event = events[eventId];

        require(_event._endDate > block.timestamp, "Event has Ended");
        require(
            _event._registeredGuestCount < _event._expectedGuestCount,
            "Registration Closed"
        );
        require(!hasRegistered[msg.sender][eventId], "Already Registered");

        // Check payment for paid events
        if (_event._type == EventType.paid) {
            require(msg.value == _event._ticketPrice, "Incorrect Ether sent");
        }

        _event._registeredGuestCount++;
        hasRegistered[msg.sender][eventId] = true;

        // Mint NFT Ticket if event has a ticket contract
        if (_event._ticketAddress != address(0)) {
            Tickets(_event._ticketAddress).mintTicket(msg.sender);
        }
    }

    // Create Event Ticket NFT
    function createEventTicket(
        uint256 eventId,
        string memory _ticketName,
        string memory _ticketSymbol
    ) external {
        require(eventId > 0 && eventId <= event_count, "Event doesn't exist.");
        require(msg.sender == events[eventId]._organizer, "Not Authorized");
        require(
            events[eventId]._ticketAddress == address(0),
            "Ticket already created"
        );

        Tickets eventTicket = new Tickets(
            address(this),
            _ticketName,
            _ticketSymbol
        );
        events[eventId]._ticketAddress = address(eventTicket);
    }

    // Confirm Attendee at Event
    function confirmAttendee(uint256 eventId, uint256 ticketId) external {
        EventDetails storage _event = events[eventId];

        require(
            msg.sender == _event._organizer,
            "Only organizer can confirm attendees"
        );
        require(eventId > 0 && eventId <= event_count, "Event doesn't exist");
        require(
            _event._ticketAddress != address(0),
            "Event has no ticket system"
        );

        address ticketOwner = Tickets(_event._ticketAddress).ownerOf(ticketId);
        require(ticketOwner != address(0), "Invalid ticket");
        require(
            !isAttendeeConfirmed[eventId][ticketOwner],
            "Attendee already confirmed"
        );

        _event._verifiedGuestCount++;
        isAttendeeConfirmed[eventId][ticketOwner] = true;
    }
}
