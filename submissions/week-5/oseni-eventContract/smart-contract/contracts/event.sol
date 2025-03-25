// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import "./erc721.sol";

interface Tickets {
    function mintTicket(address to, uint256 eventId) external;
    function ownerOf(uint256 tokenId) external view returns (address);
}

contract EventContract {
    enum EventType {
        free,
        paid
    }

    event EventCreated(uint256 indexed _id, address indexed _organizer);
    event TicketPurchased(uint256 indexed _eventId, address indexed _buyer);
    event AttendanceConfirmed(uint256 indexed _eventId, address indexed _guest);

    struct EventDetails {
        string _title;
        string _description;
        uint256 _startDate;
        uint256 _endDate;
        EventType _type;
        uint32 _expectedGuestCount;
        uint32 _registeredGuestCount;
        uint32 _verifiedGuestCount;
        address _organizer;
        address _ticketAddress;
    }

    uint256 public event_count;
    mapping(uint256 => EventDetails) public events;
    mapping(address => mapping(uint256 => bool)) hasRegistered;

    // Create an event
    function createEvent(
        string memory _title,
        string memory _desc,
        uint256 _startDate,
        uint256 _endDate,
        EventType _type,
        uint32 _egc
    ) external {
        require(msg.sender != address(0), "UNAUTHORIZED CALLER");
        require(_startDate > block.timestamp, "START DATE MUST BE IN FUTURE");
        require(_startDate < _endDate, "ENDDATE MUST BE GREATER");

        uint256 _eventId = ++event_count;
        events[_eventId] = EventDetails({
            _title: _title,
            _description: _desc,
            _startDate: _startDate,
            _endDate: _endDate,
            _type: _type,
            _expectedGuestCount: _egc,
            _registeredGuestCount: 0,
            _verifiedGuestCount: 0,
            _organizer: msg.sender,
            _ticketAddress: address(0)
        });

        emit EventCreated(_eventId, msg.sender);
    }

    // Register for an event (free or paid)
    function registerForEvent(uint256 _eventId) external {
        require(_eventId <= event_count && _eventId != 0, "EVENT DOESN'T EXIST");
        EventDetails storage _eventInstance = events[_eventId];
        require(block.timestamp < _eventInstance._endDate, "EVENT HAS ENDED");
        require(
            _eventInstance._registeredGuestCount < _eventInstance._expectedGuestCount,
            "REGISTRATION CLOSED"
        );
        require(!hasRegistered[msg.sender][_eventId], "ALREADY REGISTERED");

        if (_eventInstance._type == EventType.paid) {
            // For paid events, ensure payment logic is handled elsewhere (e.g., via a separate purchaseTicket function).
            _purchaseTicket(_eventId);
        } else {
            // For free events, directly mint the ticket.
            _mintTicket(_eventId, msg.sender);
        }

        _eventInstance._registeredGuestCount++;
        hasRegistered[msg.sender][_eventId] = true;
    }

    // Purchase a ticket for a paid event
    function purchaseTicket(uint256 _eventId) external payable {
        EventDetails storage _eventInstance = events[_eventId];
        require(_eventInstance._type == EventType.paid, "NOT A PAID EVENT");
        require(msg.value > 0, "INSUFFICIENT PAYMENT");
        require(!hasRegistered[msg.sender][_eventId], "ALREADY PURCHASED");

        _purchaseTicket(_eventId);
        _eventInstance._registeredGuestCount++;
        hasRegistered[msg.sender][_eventId] = true;
    }

    // Confirm/verify attendance
    function confirmAttendance(uint256 _eventId) external {
        EventDetails storage _eventInstance = events[_eventId];
        require(hasRegistered[msg.sender][_eventId], "NOT REGISTERED FOR THIS EVENT");
        require(block.timestamp >= _eventInstance._startDate, "EVENT NOT STARTED YET");

        Tickets ticketContract = Tickets(_eventInstance._ticketAddress);
        require(ticketContract.ownerOf(_getTicketId(msg.sender, _eventId)) == msg.sender, "INVALID TICKET");

        _eventInstance._verifiedGuestCount++;
        emit AttendanceConfirmed(_eventId, msg.sender);
    }

    // Internal function to purchase a ticket
    function _purchaseTicket(uint256 _eventId) internal {
        EventDetails storage _eventInstance = events[_eventId];
        require(_eventInstance._ticketAddress != address(0), "TICKET CONTRACT NOT CREATED");

        Tickets ticketContract = Tickets(_eventInstance._ticketAddress);
        ticketContract.mintTicket(msg.sender, _eventId);
        emit TicketPurchased(_eventId, msg.sender);
    }

    // Internal function to mint a ticket for free events
    function _mintTicket(uint256 _eventId, address _to) internal {
        EventDetails storage _eventInstance = events[_eventId];
        require(_eventInstance._ticketAddress != address(0), "TICKET CONTRACT NOT CREATED");

        Tickets ticketContract = Tickets(_eventInstance._ticketAddress);
        ticketContract.mintTicket(_to, _eventId);
    }

    // Helper function to get ticket ID for a guest
    function _getTicketId(address _guest, uint256 _eventId) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(_guest, _eventId)));
    }
}