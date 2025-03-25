# LTK Airdrop

This project implements an ERC-20 token (LTK) and an Airdrop contract for distributing tokens to a list of addresses using a Merkle tree for efficient and secure distribution.

## Overview

The project consists of the following contracts:

*   **ILTK.sol:** Interface for the LTK token, extending IERC20 with a mint function.
*   **LTK.sol:** Implementation of the LTK token, inheriting from ERC20 and implementing the ILTK interface.
*   **Airdrop.sol:** Contract responsible for distributing LTK tokens to whitelisted addresses. It uses a Merkle tree to manage the list of eligible addresses and their corresponding amounts.

The project also includes deployment scripts and tests:

*   **deploy.ts:** Script for deploying the LTK and Airdrop contracts.
*   **claim.ts:** Script for claiming airdrop tokens.
*   **test/Airdrop.ts:** Hardhat tests for the Airdrop contract.

## Getting Started

### Prerequisites

*   Node.js and npm (or yarn)
*   Hardhat: `npm install --save-dev hardhat`
*   OpenZeppelin Contracts: `npm install @openzeppelin/contracts`
*   OpenZeppelin Merkle Tree: `npm install @openzeppelin/merkle-tree`
*   ethers.js: `npm install ethers`
*   Chai: `npm install chai`
*   @nomicfoundation/hardhat-toolbox: `npm install --save-dev @nomicfoundation/hardhat-toolbox`

### Installation

1.  Clone the repository: `git clone <repository_url>`
2.  Navigate to the project directory: `cd <project_directory>`
3.  Install dependencies: `npm install`

### Deployment

1.  Run the Hardhat network: `npx hardhat node`
2.  Deploy the contracts using the deployment script: `npx hardhat run scripts/deploy.ts`

### Claiming Airdrop

1.  Run the Hardhat network: `npx hardhat node`
2.  Claim the tokens using the claim script: `npx hardhat run scripts/claim.ts`

### Testing

Run the Hardhat tests: `npx hardhat test`

## Contracts

### ILTK.sol

Defines the interface for the LTK token, including the `mint` function.

### LTK.sol

Implements the LTK token, inheriting from OpenZeppelin's ERC20. The `mint` function allows for the creation of new tokens.

### Airdrop.sol

Manages the airdrop distribution.  It uses a Merkle tree to verify claims.

*   **`merkleRoot`:** Stores the Merkle root of the whitelisted addresses.
*   **`token`:** Address of the LTK token contract.
*   **`hasClaimed`:** Mapping to track which addresses have already claimed their tokens.
*   **`claim`:** Allows users to claim their tokens by providing a Merkle proof.
*   **`updateMerkleRoot`:** Allows the owner to update the Merkle root.

## Scripts

### deploy.ts

Deploys the LTK and Airdrop contracts. It generates the Merkle root from a list of addresses and amounts.

### claim.ts

Provides an example of how to claim tokens from the Airdrop contract. It retrieves the Merkle proof for a given address and submits it to the contract.

## Tests

### test/Airdrop.ts

Contains unit tests for the Airdrop contract, covering various scenarios such as successful claims, invalid proofs, and updating the Merkle root.
