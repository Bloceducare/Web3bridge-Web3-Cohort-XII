// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./MyNFT.sol";

contract EventContract {
    enum EventType {
        free,
        paid
    }

    event EventCreated(uint256 _id, address _organizer);
    event EventRegistered(uint256 _id, address _guest, uint256 _timestamp);
    event ticketPurchased(uint256 _id, address _guest, uint256 _timestamp);

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
    mapping(uint256 => MyNFT) public eventTickets;

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

        require(msg.sender != address(0), "UNAUTHORIZED CALLER");

        require(_startDate > block.timestamp, "START DATE MUST BE IN FUTURE");

        require(_startDate < _endDate, "ENDDATE MUST BE GREATER");

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
            _ticketAddress: address(0)
        });

        events[_eventId] = _updatedEvent;

        event_count = _eventId;

        emit EventCreated(_eventId, msg.sender);
    }

    // register for an event
    function registerForEvent(uint256 _event_id) external {
        require(msg.sender != address(0), "INVALID ADDRESS");

        // get event details
        EventDetails storage _eventInstance = events[_event_id];

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
            payable(_eventInstance._organizer).transfer(1 ether);

            purchaseTicket(_event_id, msg.sender);

            _eventInstance._registeredGuestCount += 1;

            hasRegistered[msg.sender][_event_id] = true;
        } else {
            // update registerd event guest count
            _eventInstance._registeredGuestCount += 1;
            purchaseTicket(_event_id, msg.sender);

            // updated has reg struct
            hasRegistered[msg.sender][_event_id] = true;

            // mint ticket to user
        }
        emit EventRegistered(_event_id, msg.sender, block.timestamp);
    }

    function createEventTicket(
        uint256 _eventId,
        string memory _ticketname,
        string memory _ticketSymbol
    ) external {
        require(_eventId <= event_count && _eventId != 0, "EVENT DOESNT EXIST");

        EventDetails storage _eventInstance = events[_eventId];
        uint32 expectedGuestCount = _eventInstance._expectedGuestCount;
        string memory tiketSVG = ticketTemplate(_eventId);

        require(
            msg.sender == _eventInstance._organizer,
            "ONLY ORGANIZER CAN CREATE"
        );

        require(
            _eventInstance._ticketAddress == address(0),
            "TICKET ALREADY CREATED"
        );

        MyNFT newTicket = new MyNFT(
            _ticketname,
            _ticketSymbol,
            expectedGuestCount,
            tiketSVG
        );

        eventTickets[_eventId] = newTicket;

        _eventInstance._ticketAddress = address(newTicket);
    }

    function purchaseTicket(
        uint256 _eventId,
        address _account
    ) public returns (bool) {
        require(_eventId <= event_count && _eventId != 0, "EVENT DOESNT EXIST");

        EventDetails storage _eventInstance = events[_eventId];

        require(
            _eventInstance._ticketAddress != address(0),
            "TICKET DOESNT EXIST"
        );

        MyNFT ticket = MyNFT(_eventInstance._ticketAddress);

        ticket.mint(_account);

        emit ticketPurchased(_eventId, msg.sender, block.timestamp);
        return true;
    }

    function confirmeTicket(uint256 _eventId, address _account) external view {
        require(_eventId <= event_count && _eventId != 0, "EVENT DOESNT EXIST");

        EventDetails storage _eventInstance = events[_eventId];

        require(
            _eventInstance._ticketAddress != address(0),
            "TICKET DOESNT EXIST"
        );

        MyNFT ticket = MyNFT(_eventInstance._ticketAddress);

        require(ticket.balanceOf(_account) > 0, "NO TICKET FOUND");
    }

    function ticketTemplate(
        uint256 _eventId
    ) internal view returns (string memory) {
        require(_eventId <= event_count && _eventId != 0, "EVENT DOESNT EXIST");

        EventDetails memory _eventInstance = events[_eventId];

        string memory ticketSVG = string(
            abi.encodePacked(
                '<svg width="400" height="200" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">',
                "<defs>",
                '<linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">',
                '<stop offset="0%" style="stop-color:#4CAF50; stop-opacity:1" />',
                '<stop offset="100%" style="stop-color:#2E7D32; stop-opacity:1" />',
                "</linearGradient>",
                "</defs>",
                '<rect x="0" y="0" width="400" height="200" rx="20" ry="20" fill="url(#bgGradient)" />',
                '<text x="20" y="50" font-family="Arial" font-size="20" fill="white">Ticket ID: #',
                uint2str(_eventId),
                "</text>",
                unicode'<text x="20" y="90" font-family="Arial" font-size="24" fill="white" font-weight="bold">Événement: ',
                _eventInstance._title,
                "</text>",
                unicode'<text x="20" y="90" font-family="Arial" font-size="24" fill="white" font-weight="bold">Événement: ',
                _eventInstance._type == EventType.free ? "Free" : "Paid",
                "</text>",
                '<text x="20" y="130" font-family="Arial" font-size="18" fill="white">Date: ',
                uint2str(_eventInstance._startDate),
                "</text>",
                '<line x1="20" y1="150" x2="380" y2="150" stroke="white" stroke-width="2" stroke-dasharray="5,5"/>',
                "</svg>"
            )
        );

        return ticketSVG;
    }

    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        while (_i != 0) {
            length--;
            bstr[length] = bytes1(uint8(48 + (_i % 10)));
            _i /= 10;
        }
        return string(bstr);
    }
}
