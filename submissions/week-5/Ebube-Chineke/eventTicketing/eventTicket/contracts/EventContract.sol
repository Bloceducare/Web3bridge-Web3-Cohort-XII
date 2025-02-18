// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import "./TicketFactory.sol";
import "./IEbubeOnChainNFT.sol";

contract EventContract {
    enum EventType { Free, Paid }

    event EventCreated(uint256 indexed eventId, address indexed organizer);
    event TicketMinted(address indexed user, uint256 indexed eventId, uint256 ticketId);
    event GuestCheckedIn(address indexed user, uint256 indexed eventId);

    struct EventDetails {
        string title;
        string description;
        uint256 startDate;
        uint256 endDate;
        EventType eventType;
        uint32 expectedGuestCount;
        uint32 registeredGuestCount;
        uint32 attendedGuestCount;  // New variable to track attendance
        address organizer;
        address ticketAddress;
    }

    TicketFactory public ticketFactory;
    uint256 public eventCount;
    mapping(uint256 => EventDetails) public events;
    mapping(address => mapping(uint256 => bool)) public hasRegistered;
    mapping(address => mapping(uint256 => bool)) public hasCheckedIn;  // Track check-ins

    constructor(address _ticketFactory) {
        ticketFactory = TicketFactory(_ticketFactory);
    }

    function createEvent(
        string memory _title,
        string memory _desc,
        uint256 _startDate,
        uint256 _endDate,
        EventType _eventType,
        uint32 _egc,
        string memory _ticketName,
        string memory _ticketSymbol
    ) external {
        require(_startDate > block.timestamp, "START DATE MUST BE IN FUTURE");
        require(_startDate < _endDate, "END DATE MUST BE GREATER");

        uint256 _eventId = ++eventCount;

        // Deploy a new ticket contract via the factory
        address ticketContract = ticketFactory.createTicketContract(_ticketName, _ticketSymbol);

        events[_eventId] = EventDetails({
            title: _title,
            description: _desc,
            startDate: _startDate,
            endDate: _endDate,
            eventType: _eventType,
            expectedGuestCount: _egc,
            registeredGuestCount: 0,
            attendedGuestCount: 0,  // Initialize attendedGuestCount
            organizer: msg.sender,
            ticketAddress: ticketContract
        });

        emit EventCreated(_eventId, msg.sender);
    }

    function registerForEvent(uint256 _eventId) external {
        require(_eventId <= eventCount && _eventId != 0, "EVENT DOESNT EXIST");
        require(!hasRegistered[msg.sender][_eventId], "ALREADY REGISTERED");

        EventDetails storage _event = events[_eventId];

        require(_event.registeredGuestCount < _event.expectedGuestCount, "REGISTRATION CLOSED");

        hasRegistered[msg.sender][_eventId] = true;
        _event.registeredGuestCount++;

        // Mint a ticket for the user
        require(_event.ticketAddress != address(0), "TICKETING NOT ENABLED");
        IEbubeOnChainNFT(_event.ticketAddress).mintForAddress(msg.sender);

        emit TicketMinted(msg.sender, _eventId, _event.registeredGuestCount);
    }

    function checkIn(uint256 _eventId) external {
        require(_eventId <= eventCount && _eventId != 0, "EVENT DOESNT EXIST");

        EventDetails storage _event = events[_eventId];

        require(block.timestamp >= _event.startDate, "EVENT HAS NOT STARTED");
        require(!hasCheckedIn[msg.sender][_eventId], "ALREADY CHECKED IN");

        require(
            IEbubeOnChainNFT(_event.ticketAddress).balanceOf(msg.sender) > 0,
            "NO VALID TICKET"
        );

        hasCheckedIn[msg.sender][_eventId] = true;
        _event.attendedGuestCount++;

        emit GuestCheckedIn(msg.sender, _eventId);
    }
}
