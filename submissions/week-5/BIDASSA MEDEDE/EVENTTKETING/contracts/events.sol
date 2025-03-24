// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import "./MededeNFT.sol";

contract EventContract {
    enum EventType { FREE, PAID }

    event EventCreated(uint256 eventId, address organizer);
    event TicketPurchased(uint256 eventId, address buyer);
    event AttendanceConfirmed(uint256 eventId, address guest);

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

    uint256 public eventCount;
    mapping(uint256 => EventDetails) public events;
    mapping(address => mapping(uint256 => bool)) public hasRegistered;

    // Créer un événement
    function createEvent(
        string memory title,
        string memory description,
        uint256 startDate,
        uint256 endDate,
        EventType eventType,
        uint32 expectedGuestCount
    ) external {
        require(msg.sender != address(0), "UNAUTHORIZED CALLER");
        require(startDate > block.timestamp, "START DATE MUST BE IN FUTURE");
        require(startDate < endDate, "END DATE MUST BE GREATER");

        uint256 eventId = eventCount + 1;
        events[eventId] = EventDetails({
            title: title,
            description: description,
            startDate: startDate,
            endDate: endDate,
            eventType: eventType,
            expectedGuestCount: expectedGuestCount,
            registeredGuestCount: 0,
            verifiedGuestCount: 0,
            organizer: msg.sender,
            ticketAddress: address(0)
        });

        eventCount = eventId;
        emit EventCreated(eventId, msg.sender);
    }

    // Créer un ticket NFT pour un événement
    function createEventTicket(uint256 eventId, string memory ticketName, string memory ticketSymbol, string memory baseURI) external {
        require(eventId <= eventCount && eventId != 0, "EVENT DOES NOT EXIST");
        EventDetails storage eventInstance = events[eventId];

        require(msg.sender == eventInstance.organizer, "ONLY ORGANIZER CAN CREATE");
        require(eventInstance.ticketAddress == address(0), "TICKET ALREADY CREATED");

        MededeNFT newTicket = new MededeNFT(ticketName, ticketSymbol, baseURI);
        eventInstance.ticketAddress = address(newTicket);
    }

    // Acheter un ticket NFT
    function purchaseTicket(uint256 eventId, string memory ticketImage) external payable {
        require(eventId <= eventCount && eventId != 0, "EVENT DOES NOT EXIST");
        EventDetails storage eventInstance = events[eventId];

        require(eventInstance.eventType == EventType.PAID, "EVENT IS FREE");
        require(eventInstance.ticketAddress != address(0), "TICKET NOT CREATED YET");
        require(eventInstance.registeredGuestCount < eventInstance.expectedGuestCount, "EVENT FULL");
        require(!hasRegistered[msg.sender][eventId], "ALREADY REGISTERED");

        MededeNFT ticketContract = MededeNFT(eventInstance.ticketAddress);
        ticketContract.mint(msg.sender, ticketImage);

        eventInstance.registeredGuestCount++;
        hasRegistered[msg.sender][eventId] = true;

        emit TicketPurchased(eventId, msg.sender);
    }

    // Confirmer la présence
    function confirmAttendance(uint256 eventId, address guest) external {
        require(eventId <= eventCount && eventId != 0, "EVENT DOES NOT EXIST");
        EventDetails storage eventInstance = events[eventId];

        require(msg.sender == eventInstance.organizer, "ONLY ORGANIZER CAN CONFIRM");
        require(hasRegistered[guest][eventId], "GUEST NOT REGISTERED");

        eventInstance.verifiedGuestCount++;

        emit AttendanceConfirmed(eventId, guest);
    }
}
