# Voting System Smart Contract

A simple Solidity smart contract for managing a basic voting system on the Ethereum blockchain. This project demonstrates the use of various Solidity features without relying on external libraries.

## Overview

- **Project**: Voting System
- **Purpose**: Implement a basic election where users can vote for candidates.
- **Blockchain**: Ethereum (tested on Sepolia testnet)
- **Solidity Version**: ^0.8.0

## Features

- **Data Types**: `uint`, `string`, `address`, `bool`
- **Constructor**: Initializes the contract, setting the deployer as the owner.
- **Modifiers**: `onlyOwner` for administrative functions, `hasNotVoted` to prevent double voting.
- **Functions**: 
  - `addCandidate`: Owner adds candidates for election.
  - `vote`: Users cast votes for candidates.
  - `getCandidateVotes`: Check vote count for a candidate.
  - `getCandidateCount`: Get the number of candidates.
  - `getWinner`: Determine and return the current winner.
- **Mappings**: Used for tracking candidate votes and voter status.
- **Structs**: Defines the structure of a candidate with `id`, `name`, and `voteCount`.
- **Error Handling**: Utilizes `require` statements for input validation and access control.

## Setup

### Prerequisites

- Node.js (v14 or later)
- npm (or yarn)
- Solidity compiler (solc)
- Hardhat for Ethereum development

### Installation

1. **Clone the Repository**:
   ```sh
   git clone <repository-url>
   cd voting-system
```
