// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import "contracts/Ticket.sol";
import "base64-sol/base64.sol";

contract EventContract {
    enum EventType {
        free,
        paid
    }

    event EventCreated(uint256 _id, address _organizer);
    event AttendeeConfirmed(uint256 _eventId, address _attendee);

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
    mapping(address => mapping(uint256 => bool)) public hasCheckedIn;

    function createEvent(
        string memory _title,
        string memory _desc,
        uint256 _startDate,
        uint256 _endDate,
        EventType _type,
        uint32 _egc
    ) external {
        uint256 _eventId = event_count + 1;
        require(msg.sender != address(0), "UNAUTHORIZED CALLER");
        require(_startDate > block.timestamp, "START DATE MUST BE IN FUTURE");
        require(_startDate < _endDate, "END DATE MUST BE GREATER");

        events[_eventId] = EventDetails({
            title: _title,
            description: _desc,
            startDate: _startDate,
            endDate: _endDate,
            eventType: _type,
            expectedGuestCount: _egc,
            registeredGuestCount: 0,
            verifiedGuestCount: 0,
            organizer: msg.sender,
            ticketAddress: address(0)
        });

        event_count = _eventId;
        emit EventCreated(_eventId, msg.sender);
    }

    function createEventTicket(
        uint256 _eventId,
        string memory _ticketname,
        string memory _ticketSymbol,
        uint256 _ticketPrice,
        uint256 _maxTicketPerUser,
        address _organizerAddress
    ) external {
        require(_eventId <= event_count && _eventId != 0, "EVENT DOESNT EXIST");
        EventDetails storage _eventInstance = events[_eventId];
        require(msg.sender == _eventInstance.organizer, "ONLY ORGANIZER CAN CREATE");
        require(_eventInstance.ticketAddress == address(0), "TICKET ALREADY CREATED");

        string memory freeTicketSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150">'
            '<rect width="100%" height="100%" fill="#4CAF50"/>'
            '<text x="50%" y="50%" font-size="20" text-anchor="middle" fill="white">'
            'Free Event Ticket</text></svg>';

        string memory paidTicketSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" viewBox="0 0 300 150">'
            '<rect width="100%" height="100%" fill="#FF9800"/>'
            '<text x="50%" y="50%" font-size="20" text-anchor="middle" fill="white">'
            'Paid Event Ticket</text></svg>';

        TicketNFT newTicket = new TicketNFT(
            address(this),
            _ticketname,
            _ticketSymbol,
            _ticketPrice,
            _maxTicketPerUser,
            _organizerAddress,
            freeTicketSVG,
            paidTicketSVG
        );

        _eventInstance.ticketAddress = address(newTicket);
    }

    function registerForEvent(uint256 _eventId) external payable {  
    require(msg.sender != address(0), "INVALID ADDRESS");

    EventDetails storage _eventInstance = events[_eventId];
    require(_eventId <= event_count && _eventId != 0, "EVENT DOESNT EXIST");
    require(_eventInstance.endDate > block.timestamp, "EVENT HAS ENDED");
    require(_eventInstance.registeredGuestCount < _eventInstance.expectedGuestCount, "REGISTRATION CLOSED");
    require(!hasRegistered[msg.sender][_eventId], "ALREADY REGISTERED");

    TicketNFT ticketInstance = TicketNFT(_eventInstance.ticketAddress);

    if (_eventInstance.eventType == EventType.paid) {
        require(msg.value == ticketInstance.ticketPrice(), "INCORRECT PAYMENT");
        payable(_eventInstance.organizer).transfer(msg.value); // Send payment to organizer
    }

    ticketInstance.mint(msg.sender);
    _eventInstance.registeredGuestCount++;
    hasRegistered[msg.sender][_eventId] = true;
}


    function confirmAttendee(uint256 _eventId, address _attendee) external {
        require(_eventId <= event_count && _eventId != 0, "EVENT DOESNT EXIST");

        EventDetails storage _eventInstance = events[_eventId];

        require(msg.sender == _eventInstance.organizer, "ONLY ORGANIZER CAN CONFIRM");
        require(hasRegistered[_attendee][_eventId], "ATTENDEE NOT REGISTERED");
        require(!hasCheckedIn[_attendee][_eventId], "ATTENDEE ALREADY CHECKED IN");

        hasCheckedIn[_attendee][_eventId] = true;
        _eventInstance.verifiedGuestCount++;

        emit AttendeeConfirmed(_eventId, _attendee);
    }
}
