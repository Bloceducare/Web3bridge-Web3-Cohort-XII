// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./Tickets.sol"; 

contract EventContract {
    address public organizer;

    enum EventType {
        free,
        paid
    }

    event TicketPurchased(uint256 eventId, address buyer);
    event EventCreated(uint256 _id, address _organizer);
    event FundsWithdrawn(address organizer, uint256 amount);

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
        address _ticketAddress;
    }

    uint256 public event_count;
    mapping(uint256 => EventDetails) public events;
    mapping(address => mapping(uint256 => bool)) public hasRegistered;

    modifier onlyOrganizer() {
        require(msg.sender == organizer, "ONLY ORGANIZER CAN CALL");
        _;
    }

    constructor(address _organizer) {
        organizer = _organizer;
    }

    function createEvent(
        string memory _title,
        string memory _desc,
        uint256 _startDate,
        uint256 _endDate,
        EventType _type,
        uint32 _egc,
        uint256 _ticketPrice
    ) external onlyOrganizer {
        require(_startDate > block.timestamp, "START DATE MUST BE IN FUTURE");
        require(_startDate < _endDate, "END DATE MUST BE GREATER");

        uint256 _eventId = event_count + 1;
        events[_eventId] = EventDetails({
            _title: _title,
            _description: _desc,
            _startDate: _startDate,
            _endDate: _endDate,
            _type: _type,
            _expectedGuestCount: _egc,
            _registeredGuestCount: 0,
            _verifiedGuestCount: 0,
            _ticketPrice: _ticketPrice,
            _ticketAddress: address(0)
        });

        event_count = _eventId;
        emit EventCreated(_eventId, msg.sender);
    }

    //this is used to create a ticket for an event
    function createEventTicket(uint256 _eventId, string memory _ticketName, string memory _ticketSymbol) external onlyOrganizer {
        require(_eventId > 0 && _eventId <= event_count, "EVENT DOESN'T EXIST");

        EventDetails storage _event = events[_eventId];

        require(_event._ticketAddress == address(0), "TICKET ALREADY CREATED");

        //create a new ticket contract for the event
        Tickets newTicket = new Tickets(address(this), _ticketName, _ticketSymbol);
        //store the ticket contract address
        _event._ticketAddress = address(newTicket);
    } 

    //this helps to purchase a ticket for an event
    function purchaseTicket(uint256 _eventId) external payable {
        EventDetails storage _event = events[_eventId];

        require(_event._startDate > block.timestamp, "EVENT NOT STARTED YET");
        require(_event._endDate > block.timestamp, "EVENT HAS ENDED");
        require(_event._registeredGuestCount < _event._expectedGuestCount, "EVENT FULL");
        require(_event._ticketAddress != address(0), "TICKET NOT CREATED");
        require(!hasRegistered[msg.sender][_eventId], "ALREADY REGISTERED");

        if (_event._type == EventType.paid) {
            require(msg.value == _event._ticketPrice, "INCORRECT TICKET PRICE");
            //payable(organizer).transfer(msg.value);
        }

        //mint a new ticket for the user
        Tickets ticketContract = Tickets(_event._ticketAddress);
        ticketContract.mintTicket(msg.sender, _event._registeredGuestCount + 1);

        _event._registeredGuestCount++;
        hasRegistered[msg.sender][_eventId] = true;
        emit TicketPurchased(_eventId, msg.sender);
    }

    function verifyAttendance(uint256 _eventId, address _attendee) external onlyOrganizer {

        EventDetails storage _event = events[_eventId];
        
        require(hasRegistered[_attendee][_eventId], "USER NOT REGISTERED");
        _event._verifiedGuestCount++;
    }

    function withdrawFunds() external onlyOrganizer {
        uint256 balance = address(this).balance;
        require(balance > 0, "NO FUNDS TO WITHDRAW");
        payable(organizer).transfer(balance);
        emit FundsWithdrawn(organizer, balance);
    }
}
