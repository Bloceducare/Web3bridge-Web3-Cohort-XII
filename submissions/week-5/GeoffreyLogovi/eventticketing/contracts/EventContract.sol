// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import "./ERC721.sol";

contract EventContract {
    enum EventType { FREE, PAID }

    event EventCreated(uint256 indexed id, address indexed organizer);
    event UserRegistered(uint256 indexed eventId, address indexed user);
    event TicketVerified(uint256 indexed eventId, address indexed user);

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

    uint256 public eventCount;
    mapping(uint256 => EventDetails) public events;
    mapping(address => mapping(uint256 => bool)) public hasRegistered;
    mapping(uint256 => OurERC721) public eventTickets;

    function createEvent(
        string memory _title,
        string memory _desc,
        uint256 _startDate,
        uint256 _endDate,
        EventType _eventType,
        uint32 _expectedGuestCount
    ) external {
        require(_startDate > block.timestamp, "Start date must be in the future");
        require(_startDate < _endDate, "End date must be after start date");

        uint256 eventId = ++eventCount;
        events[eventId] = EventDetails(
            _title,
            _desc,
            _startDate,
            _endDate,
            _eventType,
            _expectedGuestCount,
            0,
            0,
            msg.sender,
            address(0)
        );
        emit EventCreated(eventId, msg.sender);
    }

    function registerForEvent(uint256 _eventId) external {
        require(_eventId > 0 && _eventId <= eventCount, "Invalid event");
        EventDetails storage _event = events[_eventId];
        require(block.timestamp < _event.endDate, "Event has ended");
        require(_event.registeredGuestCount < _event.expectedGuestCount, "Registration closed");
        require(!hasRegistered[msg.sender][_eventId], "Already registered");

        hasRegistered[msg.sender][_eventId] = true;
        _event.registeredGuestCount++;

        if (_event.ticketAddress != address(0)) {
            eventTickets[_eventId].mint(msg.sender, _eventId);
        }
        emit UserRegistered(_eventId, msg.sender);
    }

    function createEventTicket(uint256 _eventId, string memory _ticketName, string memory _ticketSymbol) external {
        require(_eventId > 0 && _eventId <= eventCount, "Invalid event");
        EventDetails storage _event = events[_eventId];
        require(msg.sender == _event.organizer, "Only organizer can create ticket");
        require(_event.ticketAddress == address(0), "Ticket already created");

        OurERC721 ticket = new OurERC721(_ticketName, _ticketSymbol);
        _event.ticketAddress = address(ticket);
        eventTickets[_eventId] = ticket;
    }

    function verifyTicket(uint256 _eventId, uint256 _ticketId) external {
        require(_eventId > 0 && _eventId <= eventCount, "Invalid event");
        EventDetails storage _event = events[_eventId];
        require(eventTickets[_eventId].verifyTicket(_ticketId, _eventId), "Invalid ticket");
        _event.verifiedGuestCount++;
        emit TicketVerified(_eventId, msg.sender);
    }
}
