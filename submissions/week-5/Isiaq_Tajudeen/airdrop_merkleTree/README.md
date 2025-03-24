# Airdrop Smart Contract

## Overview

This project implements a Merkle-tree-based airdrop system using Hardhat and Solidity. The contract allows eligible users to claim pre-allocated ERC20 tokens within a specific time window while enforcing security and ownership controls.

## Features

- **Merkle Tree Integration**: Efficient verification of eligible addresses and amounts.
- **Time-based Access Control**: Users can only claim tokens within a specified period.
- **Pause & Unpause Functionality**: The contract owner can temporarily halt claims.
- **Administrative Controls**: Only the owner can update timing, withdraw unclaimed funds, or pause the airdrop.
- **Security Measures**: Prevents double claims, enforces eligibility checks, and ensures only the contract owner can perform administrative actions.

## Tech Stack

- **Solidity**: Smart contract language
- **Hardhat**: Development framework
- **MerkleTree.js**: Merkle tree implementation for efficient claim verification
- **Chai & Mocha**: Testing framework
- **Ethers.js**: Ethereum interaction library

## Setup Instructions

### 1. Install Dependencies

Ensure you have Node.js installed, then run:
```sh
yarn
```

### 2. Compile the Contracts
```sh
yarn hardhat compile
```

### 3. Run Tests
```sh
yarn hardhat test
```

### 3. Run Script
```sh
yarn hardhat --network localhost run ./scripts/Airdrop.ts
```

## Contract Details

### Deployment Parameters

| Parameter      | Description                                  |
| -------------- | -------------------------------------------- |
| `merkleRoot`   | Root hash of the Merkle tree                 |
| `tokenAddress` | Address of the ERC20 token being distributed |
| `startTime`    | UNIX timestamp when airdrop starts           |
| `endTime`      | UNIX timestamp when airdrop ends             |

### Events

| Event                    | Description                                         |
| ------------------------ | --------------------------------------------------- |
| `AirdropClaimed`         | Emitted when a user successfully claims tokens      |
| `AirdropPaused`          | Emitted when the owner pauses/unpauses the contract |
| `AirdropTimeUpdated`     | Emitted when the airdrop start/end time is updated  |
| `AirdropRemBalWithdrawn` | Emitted when the owner withdraws remaining funds    |

### Key Functions

| Function                             | Description                                                |
| ------------------------------------ | ---------------------------------------------------------- |
| `claimAirdrop(amount, proof)`        | Allows an eligible user to claim their tokens              |
| `setAirdropTiming(newStart, newEnd)` | Updates the airdrop start and end time (owner only)        |
| `togglePause()`                      | Pauses or unpauses the contract (owner only)               |
| `withdrawRemainingTokens()`          | Withdraws unclaimed tokens after airdrop ends (owner only) |

## Security Considerations

- Uses **Merkle Proofs** to prevent unauthorized claims.
- **Double-claim prevention** ensures each address claims only once.
- **Time restrictions** prevent claims before start or after expiration.
- **Owner controls** restrict admin actions to the contract deployer.

## Scripting Sample Image
<img width="923" alt="airdrop_merkle_tree" src="https://github.com/user-attachments/assets/98283c29-a229-4a30-9bf4-b37a32124f57" />






