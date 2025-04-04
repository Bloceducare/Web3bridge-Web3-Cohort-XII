// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./Ticket.sol";

interface INFT {
  function mintNFT(address to, string memory name, string memory description, string memory imageURI) external;
}

contract EventContract {
    enum EventType {
        free,
        paid
    }

    event EventCreated (uint256 _id, address _organizer);
    event EventTicketCreated (uint256 _eventId, address _creator);
    event EventRegistered(uint256 _eventId, address guest);
    event AttendanceVerified(uint256 _eventId, address guest);

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
    mapping(address => mapping(uint256 => bool)) public hasRegistered;

    // write functions
    // create event
    function createEvent(
        string memory _title,
        string memory _desc,
        uint256 _startDate,
        uint256 _endDate,
        EventType _type,
        uint32 _egc
    ) external {

        uint256 _eventId = event_count + 1;

        require(msg.sender != address(0), 'UNAUTHORIZED CALLER');

        require(_startDate > block.timestamp, 'START DATE MUST BE IN FUTURE');

        require(_startDate < _endDate, 'ENDDATE MUST BE GREATER');

        EventDetails memory _updatedEvent = EventDetails ({
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

        events[_eventId] = _updatedEvent;

        event_count = _eventId;

        emit EventCreated(_eventId, msg.sender);
    }

    // register for an event
    function registerForEvent(uint256 _event_id) external payable  {

        require(msg.sender != address(0), 'INVALID ADDRESS');
        
        // get event details
        EventDetails storage _eventInstance = events[_event_id];
        string memory paidImageURI = string.concat("<svg height='40' width='200' xmlns='http://www.w3.org/2000/svg'>",
        "<text x='5' y='30' fill='none' stroke='red' font-size='35'>Ticket Paid</text></svg>");
        string memory freeImageURI = string.concat("<svg height='40' width='200' xmlns='http://www.w3.org/2000/svg'>",
        "<text x='5' y='30' fill='none' stroke='red' font-size='35'>Ticket Paid</text></svg>");

        require(_event_id <= event_count && _event_id != 0, 'EVENT DOESNT EXIST');

        require(_eventInstance._endDate > block.timestamp, 'EVENT HAS ENDED');

        require(_eventInstance._registeredGuestCount < _eventInstance._expectedGuestCount, 'REGISTRATION CLOSED');

        require(hasRegistered[msg.sender][_event_id] == false, 'ALREADY REGISTERED');

        if (_eventInstance._type == EventType.paid) {
            //call internal func for ticket purchase
            require(msg.value > 0, "AMOUNT NOT ENOUGH");
            
            // mint ticket to user
            // Ticket(_eventInstance._ticketAddress).mintNFT(msg.sender, _eventInstance._title, _eventInstance._description, paidImageURI);
            INFT(_eventInstance._ticketAddress).mintNFT(msg.sender, _eventInstance._title, _eventInstance._description, paidImageURI);
            // _eventInstance._registeredGuestCount++;

            // hasRegistered[msg.sender][_event_id] = true;
        } else {
            // mint ticket to user
            // Ticket(_eventInstance._ticketAddress).mintNFT(msg.sender, _eventInstance._title, _eventInstance._description, freeImageURI);
            INFT(_eventInstance._ticketAddress).mintNFT(msg.sender, _eventInstance._title, _eventInstance._description, freeImageURI);
        }
        // update registerd event guest count
        _eventInstance._registeredGuestCount++;
        
        // updated has reg struct
        hasRegistered[msg.sender][_event_id] = true;
        // events[_event_id] = _eventInstance;

        emit EventRegistered(_event_id, msg.sender);
    } 

    function createEventTicket (uint256 _eventId, string memory _ticketname, string memory _ticketSymbol) external {

        require(_eventId <= event_count && _eventId != 0, 'EVENT DOESNT EXIST');
        
        EventDetails storage _eventInstance = events[_eventId];

        require(msg.sender == _eventInstance._organizer, 'ONLY ORGANIZER CAN CREATE');

        require(_eventInstance._ticketAddress == address(0), 'TICKET ALREADY CREATED');

        Ticket newTicket = new Ticket(_ticketname, _ticketSymbol);

        // events[_eventId]._ticketAddress = address(newTicket);

        _eventInstance._ticketAddress = address(newTicket);

        events[_eventId] = _eventInstance;

        emit EventTicketCreated(_eventId, msg.sender);
    }


    // confirm/validate of tickets
    function verifyAttendance(uint256 eventId, address attendee) external {
        EventDetails memory eventDetail = events[eventId];
        require(eventDetail._organizer == msg.sender, "ONLY ORGANIZER CAN VERIFY");
        require(hasRegistered[attendee][eventId], "NOT AN ATTENDEE FOR THIS EVENT");
        
        emit AttendanceVerified(eventId, attendee);
    }

    // read functions
}