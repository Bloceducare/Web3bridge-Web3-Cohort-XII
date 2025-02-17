# Decentralized Voting Contract with HardHat 

## Overview
This Solidity smart contract implements a decentralized voting system where an admin can add candidates, and users can vote for their preferred candidate. The contract ensures fair voting by restricting users to one vote each and only allowing the admin to add candidates.

## Features
- **Admin Privileges**: Only the admin can add candidates.
- **One Vote Per User**: Each voter can only vote once.
- **Vote Counting**: Keeps track of the number of votes each candidate receives.
- **Candidate Retrieval**: Users can view all candidates and their vote counts.

## Smart Contract Breakdown
### 1. Data Types Used:
- `address`: Stores the admin’s Ethereum address.
- `string`: Used for candidate names.
- `uint256`: Used for vote counts and array indices.
- `bool`: Tracks whether a voter has voted.

### 2. Constructor:
- Initializes the contract with an admin (the deployer).
- Accepts an array of candidate names and adds them to the contract.

### 3. Modifiers:
- `onlyAdmin`: Ensures only the admin can perform certain actions.
- `hasNotVoted`: Ensures a user hasn’t voted before casting a vote.

### 4. Functions:
- `addCandidate(string memory _name)`: Adds a new candidate (Admin only).
- `vote(uint256 candidateIndex)`: Allows a user to vote for a candidate.
- `getCandidateCount()`: Returns the total number of candidates.
- `getCandidate(uint256 index)`: Retrieves a candidate's name and vote count.

### 5. Mappings:
- `mapping(address => bool) hasVoted`: Tracks whether an address has voted.
- `mapping(string => bool) candidateExists`: Ensures candidates are unique.

### 6. Error Handling:
- `require` statements enforce rules like checking if a candidate exists, verifying valid indices, and preventing duplicate voting.

## Deployment Instructions
To deploy this contract on the Sepolia testnet using Hardhat:

1. Install dependencies:
   ```bash
   npm install hardhat ethers dotenv
   ```
2. Create a Hardhat project and configure it for Sepolia.
3. Compile the contract:
   ```bash
   npx hardhat compile
   ```
4. Deploy using igniton:
   ```bash
   
   ```

## Assignment Submission
- I pulled Pull from the Web3Bridge-CohortXII's organization repository.
- I Pushed into the `Week 3 Day 5 Assignment` folder.
- I Made a PR for review.

