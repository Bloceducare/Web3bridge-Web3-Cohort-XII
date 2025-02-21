// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import "./NFT.sol";

contract Event {
    enum EventType {
        free,
        paid
    }

    event EventCreated(uint256 _id, address _organizer);
    event TicketCreated(uint256 _eventId, address _ticketAddress);
    event AttendanceConfirmed(uint256 _eventId, address _guest);

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
        string _tokenURI;
        uint256 _amount;
        bool paymentStatus;
    }

    uint256 public event_count;
    mapping(uint256 => EventDetails) public events;
    mapping(address => mapping(uint256 => bool)) public hasRegistered;

    

     function createEvent(
        string memory _title,
        string memory _desc,
        uint256 _startDate,
        uint256 _endDate,
        EventType _type,
        uint32 _egc,
        string memory _tokenURI,
        uint256 _amount
    ) external {
        uint256 _eventId = event_count + 1;

        require(msg.sender != address(0), "UNAUTHORIZED CALLER");
        require(_startDate > block.timestamp, "START DATE MUST BE IN FUTURE");
        require(_startDate < _endDate, "ENDDATE MUST BE GREATER");

        //  storage reference instead of memory copy
        EventDetails storage newEvent = events[_eventId];
        
        newEvent._title = _title;
        newEvent._description = _desc;
        newEvent._startDate = _startDate;
        newEvent._endDate = _endDate;
        newEvent._type = _type;
        newEvent._expectedGuestCount = _egc;
        newEvent._organizer = msg.sender;
        newEvent._tokenURI = _tokenURI;
        newEvent._amount = _amount;
        event_count = _eventId;
        emit EventCreated(_eventId, msg.sender);
    }

    function registerForEvent(uint256 _event_id) external {
        require(msg.sender != address(0), "INVALID ADDRESS");
        require(_event_id <= event_count && _event_id != 0, "EVENT DOESNT EXIST");

        
        EventDetails storage _eventInstance = events[_event_id];
        
        require(_eventInstance._endDate > block.timestamp, "EVENT HAS ENDED");
        require(
            _eventInstance._registeredGuestCount < _eventInstance._expectedGuestCount,
            "REGISTRATION CLOSED"
        );
        require(!hasRegistered[msg.sender][_event_id], "ALREADY REGISTERED");

        _eventInstance._registeredGuestCount++;
        hasRegistered[msg.sender][_event_id] = true;
    }

    function createEventTicket(
        uint256 _eventId,
        string memory _ticketname,
        string memory _ticketSymbol
    ) external {
        require(_eventId <= event_count && _eventId != 0, "EVENT DOESNT EXIST");

        EventDetails memory _eventInstance = events[_eventId];

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

        events[_eventId]._ticketAddress = address(newTicket);

        emit TicketCreated(_eventId, address(newTicket));
    }

     function purchaseTicket(uint256 _eventId) external payable {
        require(_eventId <= event_count && _eventId != 0, "EVENT DOESNT EXIST");
        
        EventDetails storage _eventInstance = events[_eventId];
        
        require(_eventInstance._type == EventType.paid, "EVENT IS NOT PAID");
        require(msg.value == _eventInstance._amount, "INCORRECT PAYMENT AMOUNT");
        Tickets(_eventInstance._ticketAddress).mint(msg.sender, _eventInstance._tokenURI);

        _eventInstance.paymentStatus = true;
    }

    function confirmAttendance(uint256 _eventId) external {
        require(_eventId <= event_count && _eventId != 0, "EVENT DOESNT EXIST");

        EventDetails storage _eventInstance = events[_eventId];

        require(hasRegistered[msg.sender][_eventId], "NOT REGISTERED");

        _eventInstance._verifiedGuestCount++;

        emit AttendanceConfirmed(_eventId, msg.sender);
    }
}
