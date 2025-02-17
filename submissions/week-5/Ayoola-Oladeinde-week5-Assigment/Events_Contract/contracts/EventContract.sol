// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.20;

import "./erc721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract EventContract {
    enum EventType {
        free,
        paid
    }

    event EventCreated(uint256 indexed eventId, address indexed organizer);
    event TicketPurchased(uint256 indexed eventId, address indexed attendee, uint256 amount);
    event TicketMinted(uint256 indexed eventId, address indexed attendee, uint256 tokenId);

    struct EventDetails {
        string title;
        string description;
        uint256 startDate;
        uint256 endDate;
        EventType eventType;
        uint256 ticketPrice;
        uint32 expectedGuestCount;
        uint32 registeredGuestCount;
        uint32 verifiedGuestCount;
        address organizer;
        address ticketAddress;
    }

    uint256 public eventCount;
    mapping(uint256 => EventDetails) public events;
    mapping(address => mapping(uint256 => bool)) public hasRegistered;

    modifier onlyOrganizer(uint256 eventId) {
        require(msg.sender == events[eventId].organizer, "ONLY ORGANIZER CAN CALL");
        _;
    }

    function createEvent(
        string memory _title,
        string memory _desc,
        uint256 _startDate,
        uint256 _endDate,
        EventType _eventType,
        uint256 _ticketPrice,
        uint32 _expectedGuestCount
    ) external {
        require(_startDate > block.timestamp, "START DATE MUST BE IN FUTURE");
        require(_startDate < _endDate, "END DATE MUST BE GREATER");
        if (_eventType == EventType.paid) {
            require(_ticketPrice > 0, "PAID EVENT MUST HAVE A PRICE");
        }

        eventCount++;

        events[eventCount] = EventDetails({
            title: _title,
            description: _desc,
            startDate: _startDate,
            endDate: _endDate,
            eventType: _eventType,
            ticketPrice: _ticketPrice,
            expectedGuestCount: _expectedGuestCount,
            registeredGuestCount: 0,
            verifiedGuestCount: 0,
            organizer: msg.sender,
            ticketAddress: address(0)
        });

        emit EventCreated(eventCount, msg.sender);
    }

    function createEventTicket(
        uint256 _eventId,
        string memory _ticketName,
        string memory _ticketSymbol
    ) external returns (address) {
        require(_eventId > 0 && _eventId <= eventCount, "EVENT DOESN'T EXIST");

        EventDetails storage _eventInstance = events[_eventId];

        require(msg.sender == _eventInstance.organizer, "ONLY ORGANIZER CAN CREATE");
        require(_eventInstance.ticketAddress == address(0), "TICKET ALREADY CREATED");

        // Deploy Ticket contract
        Tickets newTicket = new Tickets(address(this), _ticketName, _ticketSymbol);

        // Store the ticket contract address
        _eventInstance.ticketAddress = address(newTicket);

        // Approve contract to transfer tickets
        newTicket.setApprovalForAll(address(this), true);

        // Mint all tickets to the contract in advance
        for (uint256 i = 1; i <= _eventInstance.expectedGuestCount; i++) {
            newTicket.safeMint(address(this), i);
        }

        return address(newTicket);
    }

    function registerForEvent(uint256 _eventId) external payable {
        require(msg.sender != address(0), "INVALID ADDRESS");
        require(_eventId > 0 && _eventId <= eventCount, "EVENT DOESN'T EXIST");

        EventDetails storage _eventInstance = events[_eventId];

        require(_eventInstance.endDate > block.timestamp, "EVENT HAS ENDED");
        require(_eventInstance.registeredGuestCount < _eventInstance.expectedGuestCount, "REGISTRATION CLOSED");
        require(!hasRegistered[msg.sender][_eventId], "ALREADY REGISTERED");

        address ticketInstance = _eventInstance.ticketAddress;
        require(ticketInstance != address(0), "TICKET NOT CREATED");

        Tickets tickets = Tickets(ticketInstance);

        _eventInstance.registeredGuestCount++;
        uint256 ticketId = _eventInstance.registeredGuestCount;

        if (_eventInstance.eventType == EventType.paid) {
            require(msg.value == _eventInstance.ticketPrice, "INSUFFICIENT PAYMENT");

            // Transfer ticket to user
            tickets.transferFrom(address(this), msg.sender, ticketId);

            hasRegistered[msg.sender][_eventId] = true;

            // Transfer Ether to the event organizer (AFTER state update)
            payable(_eventInstance.organizer).transfer(msg.value);

            emit TicketPurchased(_eventId, msg.sender, msg.value);
        } else {
            // Free event logic: Just transfer the ticket
            tickets.transferFrom(address(this), msg.sender, ticketId);

            hasRegistered[msg.sender][_eventId] = true;

            emit TicketMinted(_eventId, msg.sender, ticketId);
        }
    }

    function getRegisteredGuestCount(uint256 eventId) external view returns (uint32) {
        require(eventId > 0 && eventId <= eventCount, "INVALID EVENT ID");
        return events[eventId].registeredGuestCount;
    }
   
   function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external  returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
