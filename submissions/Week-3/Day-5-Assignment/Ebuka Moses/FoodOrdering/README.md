# Person Registry Smart Contract Documentation

## Overview
A small Food Ordering App

## Core Features
* Add food to the catalog
* Confirm Order
* Update Food


## Implementation Review

### Data Types Used
* address: For admin and verifier addresses
* uint256: For IDs, 
* string: For Food names
* bool: For verification status
* struct: For organizing Food data
* mapping: For data storage

### Key Components Review
1. Constructor
* Initializes contract state
* Sets deployer as Owner and first verifier

2. Modifiers
* onlyOwner: Restricts Owner functions
* 

1. Struct Implementation
* Food struct with name, order, price, customerAddress, and quantity


1. Error Handling
* Custom error messages
* Input validation
* State validation checks

1. Functions
* Owner function for verifier management
* Confirm functions for person management
* Update functions for data queries

## Setup Instructions

### Prerequisites
1. Node.js and npm
2. Hardhat 
3. MetaMask wallet
4. Sepolia testnet ETH

#  Deployment Contract Address:  0xCc17624A47908be63C8F74dA6d66fd44f5B369d9