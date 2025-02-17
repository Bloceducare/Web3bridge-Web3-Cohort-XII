// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "./OnChainNFT.sol";

contract EventFactory {
    enum eventType {
        free,  
        paid  
    }

    struct EventDetails {
        string title;
        string description;
        uint startDate;
        uint endDate;
        eventType _type;
        uint expectedGuestCount;
        uint registerGuestCount;
        uint verifyGuestCount;
        address organizer;
        address ticketAddress; // Address of the NFT contract for this event
    }

    uint public event_count;
    mapping(uint => EventDetails) Events;
    mapping(address => mapping(uint => bool)) hasRegistered;

    // Debugging Events
    event EventCreated(
        uint indexed eventId,
        string title,
        uint startDate,
        uint endDate,
        eventType _type,
        uint expectedGuestCount,
        address ticketAddress
    );

    event EventRegistrationAttempt(
        uint indexed eventId,
        string title,
        uint startDate,
        uint endDate,
        eventType _type,
        uint expectedGuestCount,
        uint registerGuestCount,
        address ticketAddress
    );

    event EventRegistered(uint indexed eventId, address indexed user);

    // Create a new event
    function createEvent(
        string memory title,
        string memory description,
        uint startDate,
        uint endDate,
        eventType _type,
        uint expectedGuestCount,
        string memory ticketName,
        string memory ticketSymbol
    ) external {
        require(msg.sender != address(0), "Invalid address");
        require(startDate > block.timestamp, "Start date must be in the future");
        require(endDate > startDate, "End date must be after start date");

        uint eventId = ++event_count;

        // Deploy a new OnChainNFT contract for this event
        OnChainNFT nftContract = new OnChainNFT(
            address(this), // Pass the factory contract address as the owner
            ticketName,    // Custom ticket name
            ticketSymbol  
        );

        // Ensure the NFT contract was deployed successfully
        require(address(nftContract) != address(0), "NFT contract deployment failed");

        Events[eventId] = EventDetails({
            title: title,
            description: description,
            startDate: startDate,
            endDate: endDate,
            _type: _type,
            expectedGuestCount: expectedGuestCount,
            registerGuestCount: 0,
            verifyGuestCount: 0,
            organizer: msg.sender,
            ticketAddress: address(nftContract) // Store the deployed NFT contract address
        });

        // Emit event for debugging
        emit EventCreated(
            eventId,
            title,
            startDate,
            endDate,
            _type,
            expectedGuestCount,
            address(nftContract)
        );
    }

    // Register for Free or Paid Event
    function registerForEvent(uint eventId) external payable {
        EventDetails storage eventInstance = Events[eventId];

      

        require(eventInstance.startDate > block.timestamp, "Event has already started");
        require(eventInstance.registerGuestCount < eventInstance.expectedGuestCount, "No more slots available");
        require(!hasRegistered[msg.sender][eventId], "Already registered");

        if (eventInstance._type == eventType.free) {
            // Mint a free ticket
            require(eventInstance.ticketAddress != address(0), "Invalid ticketAddress");
            OnChainNFT(eventInstance.ticketAddress).mint(msg.sender);
        } else {
            // Paid event logic
            require(msg.value > 0, "Payment required for paid events");
            payable(eventInstance.organizer).transfer(msg.value); // Transfer payment to organizer
            OnChainNFT(eventInstance.ticketAddress).mintPaidTicket(msg.sender);
        }

        // Update registration status
        hasRegistered[msg.sender][eventId] = true;
        eventInstance.registerGuestCount += 1;

        // Debugging: Log successful registration
        emit EventRegistered(eventId, msg.sender);
    }

    // Confirm Attendance
    function confirmAttendance(uint eventId, address guest) external {
        EventDetails storage eventInstance = Events[eventId];
        require(msg.sender == eventInstance.organizer, "Only the organizer can confirm attendance");
        require(block.timestamp >= eventInstance.endDate, "Event has not ended yet");
        require(hasRegistered[guest][eventId], "Guest is not registered");

        eventInstance.verifyGuestCount += 1;
    }

    // Get Ticket Address for an Event
    function getTicketAddress(uint eventId) external view returns (address) {
        return Events[eventId].ticketAddress;
    }
}