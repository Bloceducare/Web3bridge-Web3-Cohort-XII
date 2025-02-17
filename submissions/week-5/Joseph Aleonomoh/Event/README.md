# Event Ticketing System

This project implements a decentralized event ticketing system using Solidity smart contracts. It allows event organizers to create events, issue tickets as NFTs, and manage attendee registration and verification. Attendees can register for events and receive tickets as NFTs, which can then be verified at the event.

## Contracts

### 1. `Erc721.sol`

This contract implements an ERC721 NFT representing a ticket. Each ticket is unique and can be transferred.

*   **`mint(address _to)`:** Mints a new ticket NFT to the specified address. Only the contract owner can call this function.

### 2. `Event.sol`

This is the main contract that manages events, ticket creation, registration, and verification.

*   **`createEvent(...)`:** Creates a new event with details like title, description, start/end dates, fee, type (free/paid), expected guest count, etc.  It also generates a new `TicketNFT` contract for the event. Only the contract owner can call this function.
*   **`registerForEvent(uint256 _event_id)`:** Allows users to register for an event.  For paid events, it requires the correct fee to be sent.  Mints a ticket NFT to the registrant.
*   **`createEventTicket(...)`:** Creates an event ticket (NFT contract instance). This is called internally by `createEvent`.
*   **`purchaseTicket(...)`:** Mints the NFT to the user. This is called internally by `registerForEvent`.
*   **`verifyAttendance(uint256 _eventId, uint256 _ticketId)`:** Allows the event organizer to verify a ticket.
*   **`isVerifiedTicket(uint256 _ticketId, uint256 _eventId)`:** Checks if a ticket has been verified.
*   **`getHasRegistered(uint256 _eventId, address _address)`:** Checks if an address has registered for an event.
*   **`getTicketIds(uint256 _ticketId)`:** Retrieves the event ID associated with a ticket ID.
*   **`withdrawForEvent(uint256 eventId)`:** Allows the event organizer to withdraw the funds collected for a paid event.

## Scripts

### 1. `deploy.ts`

Deploys the `EventContract` to the network.

### 2. `createEvent.ts`

Interacts with the deployed `EventContract` to create a new event.

### 3. `registerEvent.ts`

Interacts with the deployed `EventContract` to register a user for an event.

### 4. `verifyTicket.ts`

Interacts with the deployed `EventContract` to verify a ticket.

### 5. `withdraw.ts`

Interacts with the deployed `EventContract` to withdraw funds from an event.

### 6. `test-flow.ts`

Combines all the above operations in a single script, allowing to perform them in a sequence.

## Tests

### `Event.ts`

Contains unit tests for the `EventContract` using Hardhat's testing framework and Chai assertions.  Covers various scenarios for event creation, registration, verification, and withdrawals.

## Getting Started

1.  **Clone the repository:** `git clone <repository_url>`
2.  **Install dependencies:** `npm install`
3.  **Compile contracts:** `npx hardhat compile`
4.  **Deploy contracts:** `npx hardhat run scripts/deploy.js`
5.  **Run scripts:** `npx hardhat run scripts/<script_name>.js`
6.  **Run tests:** `npx hardhat test`

## Prerequisites

*   Node.js and npm
*   Hardhat
*   ethers.js
