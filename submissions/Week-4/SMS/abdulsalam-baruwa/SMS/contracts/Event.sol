// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

contract EventContract {
    enum EventType {
        free,
        paid
    }

    event EventCreated (uint256 _id, address _organizer);

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
    }

    uint256 public event_count;
    mapping(uint256 => EventDetails) public events;
    mapping(address => mapping(uint256 => bool)) hasRegistered;

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
            _organizer: msg.sender 
        });

        events[_eventId] = _updatedEvent;

        event_count = _eventId;

        emit EventCreated(_eventId, msg.sender);
    }

    // register for an event
    function registerForEvent(uint256 _event_id) external {

        require(msg.sender != address(0), 'INVALID ADDRESS');
        
        // get event details
        EventDetails memory _eventInstance = events[_event_id];

        require(_event_id <= event_count && _event_id != 0, 'EVENT DOESNT EXIST');

        require(_eventInstance._endDate > block.timestamp, 'EVENT HAS ENDED');

        require(_eventInstance._registeredGuestCount < _eventInstance._expectedGuestCount, 'REGISTRATION CLOSED');

        require(hasRegistered[msg.sender][_event_id] == false, 'ALREADY REGISTERED');

        if (_eventInstance._type == EventType.paid) {
            //call internal func for ticket purchase

            // mint ticket to user
            _eventInstance._registeredGuestCount++;


            hasRegistered[msg.sender][_event_id] = true;
        }
        else {
            // update registerd event guest count
            _eventInstance._registeredGuestCount++;
            
            // updated has reg struct
            hasRegistered[msg.sender][_event_id] = true;

            // mint ticket to user

        }
    } 

    // confirm/validate of tickets

    // read functions
}