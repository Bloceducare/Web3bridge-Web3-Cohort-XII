// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import "./Tickets.sol";
import "./ITickets.sol";

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Event {
    using SafeERC20 for IERC20;

    Itickets public TicketContract;

    enum EventType {
        free,
        paid
    }

    struct EventDetails {
        string title;
        string desc;
        uint256 startDate;
        uint256 endDate;
        EventType eventType;
        uint32 expectedGuest;
        uint32 registerGuestCount;
        uint32 verifiedGuestCount;
        address organiser;
        address ticketAddress;
        uint256 ticketPrice;
        uint256 ticketIncomeBal;
    }

    struct TicketDetails {
        address ticketAddress;
        uint price;
    }

    uint256 public eventCount;
    address public owner;

    mapping(uint256 => EventDetails) public events;
    mapping(address => mapping(uint256 => bool)) private hasRegistered;

    constructor() {
        owner = msg.sender;
    }

    // events
    event EventCreated(uint256 _eventId, address _creator);
    event EventTicketCreated(
        uint256 _eventId,
        address _creator,
        address _ticketAddress,
        uint256 _ticketPrice
    );

    function createEvent(
        string memory _title,
        string memory _desc,
        uint256 _startDate,
        uint256 _endDate,
        EventType _type,
        uint32 _eg
    ) external {
        require(msg.sender != address(0), "Zero address not allowed");
        require(_startDate > block.timestamp, "Start date must be in future");
        require(_startDate < _endDate, "End date must be greater");

        uint256 eventId = eventCount += 1;

        EventDetails memory _updateEvent = EventDetails({
            title: _title,
            desc: _desc,
            startDate: _startDate,
            endDate: _endDate,
            eventType: _type,
            expectedGuest: _eg,
            registerGuestCount: 0,
            verifiedGuestCount: 0,
            organiser: msg.sender,
            ticketAddress: address(0),
            ticketPrice: 0,
            ticketIncomeBal: 0
        });

        events[eventId] = _updateEvent;

        eventCount = eventId;

        emit EventCreated(eventId, msg.sender);
    }

    function createEventTicket(
        uint256 _eventId,
        uint256 _ticketPrice,
        string memory _ticketUri,
        string memory _ticketName,
        string memory _ticketSymbol
    ) external {
        require(_eventId <= eventCount && _eventId != 0, "EVENT DOESNT EXIST");

        EventDetails storage eventInstance = events[_eventId];

        require(
            msg.sender == eventInstance.organiser,
            "ONLY ORGANIZER CAN CREATE"
        );

        require(
            eventInstance.ticketAddress == address(0),
            "TICKET ALREADY CREATED"
        );

        if (eventInstance.eventType == EventType.paid) {
            eventInstance.ticketPrice = _ticketPrice;
        } else {
            require(_ticketPrice == 0, "A free event must cost 0 price");
            _ticketPrice = 0;
            eventInstance.ticketPrice = _ticketPrice;
        }

        address newTicket = address(
            new Tickets(address(this), _ticketUri, _ticketName, _ticketSymbol)
        );

        // events[_eventId].ticketAddress = newTicket;

        eventInstance.ticketAddress = newTicket;

        emit EventTicketCreated(_eventId, msg.sender, newTicket, _ticketPrice);
    }

    function registerForEvent(
        uint256 _eventId,
        IERC20 _token
    ) external returns (bool) {
        require(msg.sender != address(0), "Not allowed");

        EventDetails storage eventInstance = events[_eventId];

        require(_eventId <= eventCount && _eventId != 0, "Event doesn't exist");
        require(eventInstance.endDate > block.timestamp, "Event has ended");
        require(
            eventInstance.registerGuestCount < eventInstance.expectedGuest,
            "Registration has closed"
        );
        require(
            !hasRegistered[msg.sender][_eventId],
            "This user has already registered"
        );

        // handle paid events
        if (eventInstance.eventType == EventType.paid) {
            uint256 ticketPrice = eventInstance.ticketPrice;
            require(
                _token.allowance(msg.sender, address(this)) >= ticketPrice,
                "Allowance is low"
            );

            require(
                _token.transferFrom(msg.sender, address(this), ticketPrice),
                "Transfer failed"
            );

            eventInstance.ticketIncomeBal += ticketPrice;
        }

        address ticketAddr = eventInstance.ticketAddress;
        require(ticketAddr != address(0), "Ticket contract not set");

        Itickets ticketContract = Itickets(ticketAddr);
        ticketContract.safeMint(msg.sender);

        eventInstance.registerGuestCount++;
        hasRegistered[msg.sender][_eventId] = true;

        return true;
    }

    function verifyAttendance(uint256 _eventId, address _attendee) external returns (bool) {
        
    }
}

// 0x8d9cb8f3191Fd685e2C14D2AC3Fb2b16D44EAfc3 usdt on base
// 0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B usdc on celo
