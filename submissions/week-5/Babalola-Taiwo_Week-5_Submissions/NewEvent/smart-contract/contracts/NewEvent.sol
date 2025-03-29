// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "./erc721.sol";

contract NewEvent {

    enum  EventType {
        paid, 
        free
    }

    struct EventInfo {
        string eventTitle;
        string eventDescription;
        uint256 eventDate;
        uint256 eventEndDate;
        EventType eventTypes;
        uint expectedAttendeeCount;
        uint registeredAttendeeCount;
        uint verifiedAttendeeCount;
        address organizer;

        address ticketAddress;
        uint256 ticketPrice;
    }


    uint public eventCounter;
    mapping(uint256 => EventInfo)public events; // saves the events created in arrays()
    

    function organizerCreateEvent (string memory _eventTitle, string memory _eventDesc, uint _eventDate, uint _eventEndDate, EventType _eventType, uint _expectedAttdCnt, uint256 _ticketPrice) external {
        uint256 eventID = eventCounter + 1;

        require(msg.sender != address(0), "INVALID ADDRESS");
        require(_eventDate > block.timestamp, "EVENT DATE SHOULD BE IN FUTURE");
        require(_eventEndDate > _eventDate, "END DATE MUST BE AFTER START DATE");

        //Data type  -  variable name = value
        events[eventID] = EventInfo ({
            eventTitle: _eventTitle, 
            eventDescription: _eventDesc, 
            eventDate: _eventDate, 
            eventEndDate: _eventEndDate, 
            eventTypes: _eventType, 
            expectedAttendeeCount: _expectedAttdCnt, 
            registeredAttendeeCount: 0,
            verifiedAttendeeCount: 0,
            organizer: msg.sender,

            ticketAddress: address(0),
            ticketPrice: _ticketPrice
        });

        eventCounter = eventID; //intialize event counter to the number of the event ID
    }


    mapping(address => mapping(uint256 => bool))public isRegistered; // check if particpant already registred

    function registerForEvent(uint eventID) external {
        require(msg.sender != address(0), "INVALID ADDRESS");
        require(eventID != 0 && eventID <= eventCounter, "EVENT DOESNT EXIST");
        require(events[eventID].eventEndDate > block.timestamp, "EVENT CLOSED");
        require(events[eventID].registeredAttendeeCount < events[eventID].expectedAttendeeCount, "SLOT FINISHED FOR THE EVENT");
        require(isRegistered[msg.sender][eventID] == false, "YOU'RE ALREADY REGISTERED");

         if (events[eventID].eventTypes == EventType.paid) {
            events[eventID].registeredAttendeeCount++;
            isRegistered[msg.sender][eventID] = true;
        } else {
            events[eventID].registeredAttendeeCount++;
            isRegistered[msg.sender][eventID] = true;
        }
    }


    function generateEventTicket(uint256 eventID, string memory ticketName, string memory ticketSymbol) external {
    require(eventID > 0 && eventID <= eventCounter, "EVENT DOES NOT EXIST");
    require(msg.sender == events[eventID].organizer, "ONLY ORGANIZER CAN CREATE TICKET");
    require(events[eventID].ticketAddress == address(0), "TICKET ALREADY CREATED");

    // Deploys new Ticket contract using `address(this)`
    Tickets eventTicket = new Tickets(address(this), ticketName, ticketSymbol);
    events[eventID].ticketAddress = address(eventTicket);
    }



    function purchaseTicket(uint256 eventID) public payable {
    require(eventID > 0 && eventID <= eventCounter, "INVALID EVENT ID");

    EventInfo storage eventInfo = events[eventID];

    require(eventInfo.eventTypes == EventType.paid, "THIS EVENT IS FREE");
    require(msg.value == eventInfo.ticketPrice, "INCORRECT TICKET PRICE");
    require(eventInfo.ticketAddress != address(0), "TICKET NOT GENERATED YET");

   
    Tickets ticketContract = Tickets(eventInfo.ticketAddress);  // Mint NFT ticket (by organizer)
    ticketContract.safeMint(msg.sender); 

    eventInfo.registeredAttendeeCount++;
}


    function verifyAttendee(uint256 eventID, address attendee) external {
    require(eventID > 0 && eventID <= eventCounter, "EVENT DOES NOT EXIST");
    require(msg.sender == events[eventID].organizer, "ONLY ORGANIZER CAN VERIFY ATTENDEES");
    require(isRegistered[attendee][eventID], "ATTENDEE IS NOT REGISTERED");
    require(events[eventID].verifiedAttendeeCount < events[eventID].registeredAttendeeCount, "ALL REGISTERED ATTENDEES ALREADY VERIFIED");

    events[eventID].verifiedAttendeeCount++;
}



}
