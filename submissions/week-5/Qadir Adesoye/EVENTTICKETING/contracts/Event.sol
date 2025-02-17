// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import "./ERC721.sol";

contract EventContract {
    // Ticket Status
    enum EventType {
        free,
        paid
    }

    event EventCreated(uint256 _id, address _organizer);

    event RegisterEvent(uint256 _id, address _address);

    event VerifiedTicket(uint256 _event_id, uint256 _ticket_id);

    struct EventDetails {
        string _title;
        string _description;
        uint256 _startDate;
        uint256 _endDate;
        EventType _type;
        uint256 eventFee;
        uint32 _expectedGuestCount;
        uint32 _registeredGuestCount;
        uint32 _verifiedGuestCount;
        address _organizer;
        address _ticketAddress;
    }

    uint256 public event_count;
    mapping(uint256 => EventDetails) public events;
    mapping(address => mapping(uint256 => bool)) hasRegistered;
    mapping(uint256 => uint256) ticketIds;
    mapping(uint256 => TicketNFT) public ticketInstance;
    mapping(uint256 => mapping(uint256 => bool)) isVerified;

    // write functions
    // create event
    function createEvent(
        string memory _title,
        string memory _desc,
        uint256 _startDate,
        uint256 _endDate,
        uint256 _eventFee,
        EventType _type,
        uint32 _egc
    ) external {
        uint256 _eventId = event_count + 1;

        require(msg.sender != address(0), "UNAUTHORIZED CALLER");

        require(_startDate > block.timestamp, "START DATE MUST BE IN FUTURE");

        require(_startDate < _endDate, "ENDDATE MUST BE GREATER");

        if (_type == EventType.paid) {
            require(_eventFee > 0, "Fee Required For a Paid Event");
        } else {
            require(_eventFee == 0, "NO Fee Required!!");
        }

        EventDetails memory _updatedEvent = EventDetails({
            _title: _title,
            _description: _desc,
            _startDate: _startDate,
            _endDate: _endDate,
            _type: _type,
            eventFee: _eventFee,
            _expectedGuestCount: _egc,
            _registeredGuestCount: 0,
            _verifiedGuestCount: 0,
            _organizer: msg.sender,
            _ticketAddress: address(0)
        });

        events[_eventId] = _updatedEvent;

        event_count = _eventId;

        bytes memory __title = bytes(_title);
        string memory __symbol = string(
            abi.encodePacked(__title[0], __title[1], __title[2])
        );
        createEventTicket(_eventId, _title, __symbol);

        emit EventCreated(_eventId, msg.sender);
    }

    // register for an event
    function registerForEvent(uint256 _event_id) external payable {
        require(msg.sender != address(0), "INVALID ADDRESS");

        // get event details
        EventDetails memory _eventInstance = events[_event_id];

        require(
            _event_id <= event_count && _event_id != 0,
            "EVENT DOESNT EXIST"
        );

        require(_eventInstance._endDate > block.timestamp, "EVENT HAS ENDED");

        require(
            _eventInstance._registeredGuestCount <
                _eventInstance._expectedGuestCount,
            "REGISTRATION CLOSED"
        );

        require(
            hasRegistered[msg.sender][_event_id] == false,
            "ALREADY REGISTERED"
        );

        if (_eventInstance._type == EventType.paid) {
            //call internal func for ticket purchase
            require(
                address(msg.sender).balance > _eventInstance.eventFee,
                "NOT ENOUGH FUNDS"
            );
            require(msg.value == _eventInstance.eventFee, "FEE NOT COMPLETE");

            // mint ticket to user
            purchaseTicket(_event_id, msg.sender);

            _eventInstance._registeredGuestCount += 1;

            hasRegistered[msg.sender][_event_id] = true;
        } else {
            purchaseTicket(_event_id, msg.sender);

            _eventInstance._registeredGuestCount += 1;

            hasRegistered[msg.sender][_event_id] = true;
        }

        events[_event_id] = _eventInstance;

        emit RegisterEvent(_event_id, msg.sender);
    }

     

    function createEventTicket(
        uint256 _eventId,
        string memory _ticketname,
        string memory _ticketSymbol
    ) internal {
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

        //factory pattern
        
        TicketNFT newTicket = new TicketNFT(_ticketname, _ticketSymbol); 

        events[_eventId]._ticketAddress = address(newTicket);

        ticketInstance[_eventId] = newTicket;

        // _eventInstance._ticketAddress = address(newTicket);
    }

    function purchaseTicket(uint256 _eventId, address _to) internal {
        require(_eventId <= event_count && _eventId != 0, "EVENT DOESNT EXIST");
        ticketIds[ticketInstance[_eventId].nftCount()] = _eventId;
        ticketInstance[_eventId].mint(_to);
    }

    // confirm/validate of tickets

    function verifyAttendance(uint256 _eventId, uint256 _ticketId) public {
        require(_eventId <= event_count && _eventId != 0, "EVENT DOESNT EXIST");

        EventDetails memory _eventInstance = events[_eventId];

        require(
            msg.sender == _eventInstance._organizer,
            "ONLY ORGANIZER CAN VERIFY"
        );
        require(_eventInstance._endDate > block.timestamp, "EVENT HAS ENDED");

        require(
            _eventInstance._registeredGuestCount <
                _eventInstance._expectedGuestCount,
            "REGISTRATION CLOSED"
        );
        require(ticketIds[_ticketId] == _eventId, "TICKET NOT FOR EVENT");

        isVerified[_eventId][_ticketId] = true;

        _eventInstance._verifiedGuestCount += 1;
        events[_eventId] = _eventInstance;

        emit VerifiedTicket(_eventId, _ticketId);
    }

    // read functions
    function isVerifiedTicket(
        uint256 _ticketId,
        uint256 _eventId
    ) public view returns (bool) {
        return isVerified[_eventId][_ticketId];
    }

    function getHasRegistered(
        uint256 _eventId,
        address _address
    ) public view returns (bool) {
        return hasRegistered[_address][_eventId];
    }

    function getTicketIds(uint256 _ticketId) public view returns (uint256) {
        return ticketIds[_ticketId];
    }
}
