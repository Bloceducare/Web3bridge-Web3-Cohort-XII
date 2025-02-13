# Person Registry Smart Contract Documentation

## Overview
The Person Registry Smart Contract is a decentralized application built on the Ethereum blockchain that manages a registry of people. It implements a role-based access control system where admin and verifiers can manage person records.

## Core Features
* Add new persons to the registry
* Verify person records
* Update person information
* Manage verifiers (add/remove)
* Query person information

## Implementation Review

### Data Types Used
* `address`: For admin and verifier addresses
* `uint256`: For IDs, age, and timestamps
* `string`: For storing names
* `bool`: For verification status
* `struct`: For organizing person data
* `mapping`: For data storage

### Key Components Review
1. Constructor
* Initializes contract state
* Sets deployer as admin and first verifier

2. Modifiers
* `onlyAdmin`: Restricts admin functions
* `onlyVerifier`: Restricts verifier functions

3. Struct Implementation
* Person struct with name, age, verification status, and timestamp
* Efficient data organization

4. Error Handling
* Custom error messages
* Input validation
* State validation checks

5. Functions
* Admin functions for verifier management
* Verifier functions for person management
* Public view functions for data queries

## Setup Instructions

### Prerequisites
1. Node.js and npm
2. Hardhat 
3. MetaMask wallet
4. Sepolia testnet ETH

#  Deployment Contract Address:  0xCc17624A47908be63C8F74dA6d66fd44f5B369d9