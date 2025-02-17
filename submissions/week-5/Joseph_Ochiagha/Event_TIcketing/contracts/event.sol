//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import "./erc721.sol";

contract EventContract {
    enum EventType {
        free,
        paid
    }

    event EventCreated(uint256 _id, address _organizer);
    event TicketPurchased(uint256 _eventId, address _buyer);
    event AttendanceConfirmed(uint256 _eventId, address _attendee);

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
        uint256 _ticketPrice;
    }

    uint256 public event_count;
    mapping(uint256 => EventDetails) public events;
    mapping(address => mapping(uint256 => bool)) public hasRegistered;
    mapping(address => mapping(uint256 => bool)) public hasAttended;

    // Create event
    function createEvent(
        string memory _title,
        string memory _desc,
        uint256 _startDate,
        uint256 _endDate,
        EventType _type,
        uint32 _egc,
        uint256 _ticketPrice
    ) external {
        uint256 _eventId = event_count + 1;

        require(msg.sender != address(0), "UNAUTHORIZED CALLER");
        require(_startDate > block.timestamp, "START DATE MUST BE IN FUTURE");
        require(_startDate < _endDate, "END DATE MUST BE GREATER");

        EventDetails memory _updatedEvent = EventDetails({
            _title: _title,
            _description: _desc,
            _startDate: _startDate,
            _endDate: _endDate,
            _type: _type,
            _expectedGuestCount: _egc,
            _registeredGuestCount: 0,
            _verifiedGuestCount: 0,
            _organizer: msg.sender,
            _ticketAddress: address(0),
            _ticketPrice: _ticketPrice
        });

        events[_eventId] = _updatedEvent;
        event_count = _eventId;

        emit EventCreated(_eventId, msg.sender);
    }

    // Create event ticket
    function createEventTicket(
        uint256 _eventId,
        string memory _ticketname,
        string memory _ticketSymbol
    ) external {
        require(_eventId <= event_count && _eventId != 0, "EVENT DOESNT EXIST");

        EventDetails storage _eventInstance = events[_eventId];

        require(
            msg.sender == _eventInstance._organizer,
            "ONLY ORGANIZER CAN CREATE"
        );

        require(
            _eventInstance._ticketAddress == address(0),
            "TICKET ALREADY CREATED"
        );

        Tickets newTicket = new Tickets(
            address(this),
            _ticketname,
            _ticketSymbol
        );

        _eventInstance._ticketAddress = address(newTicket);
    }

    // Purchase ticket
    function purchaseTicket(uint256 _eventId) external payable {
        require(msg.sender != address(0), "INVALID ADDRESS");

        EventDetails storage _eventInstance = events[_eventId];

        require(_eventId <= event_count && _eventId != 0, "EVENT DOESNT EXIST");

        require(_eventInstance._endDate > block.timestamp, "EVENT HAS ENDED");

        require(
            _eventInstance._registeredGuestCount <
                _eventInstance._expectedGuestCount,
            "REGISTRATION CLOSED"
        );

        require(
            hasRegistered[msg.sender][_eventId] == false,
            "ALREADY REGISTERED"
        );

        if (_eventInstance._type == EventType.paid) {
            require(
                msg.value == _eventInstance._ticketPrice,
                "INCORRECT TICKET PRICE"
            );

            // Transfer ticket price to organizer
            payable(_eventInstance._organizer).transfer(msg.value);

            // Mint ticket to user
            Tickets(_eventInstance._ticketAddress).mintTicket(msg.sender);
        } else {
            // Mint ticket to user
            Tickets(_eventInstance._ticketAddress).mintTicket(msg.sender);
        }

        _eventInstance._registeredGuestCount++;
        hasRegistered[msg.sender][_eventId] = true;

        emit TicketPurchased(_eventId, msg.sender);
    }

    // Confirm/verify attendance
    function confirmAttendance(uint256 _eventId, address _attendee) external {
        require(msg.sender != address(0), "INVALID ADDRESS");

        EventDetails storage _eventInstance = events[_eventId];

        require(_eventId <= event_count && _eventId != 0, "EVENT DOESNT EXIST");

        require(
            msg.sender == _eventInstance._organizer,
            "ONLY ORGANIZER CAN CONFIRM"
        );

        require(hasRegistered[_attendee][_eventId] == true, "NOT REGISTERED");

        require(hasAttended[_attendee][_eventId] == false, "ALREADY CONFIRMED");

        _eventInstance._verifiedGuestCount++;
        hasAttended[_attendee][_eventId] = true;

        emit AttendanceConfirmed(_eventId, _attendee);
    }
}
