# PiggyBank Smart Contract with ERC20 & ERC721

A decentralized savings platform that enables users to save ERC20 tokens and earn ERC721 NFT rewards, built with Solidity and Hardhat.

## Features

- Deposit ERC20 tokens as savings
- Time-locked withdrawals
- Manager-controlled withdrawals
- Target amount requirement
- Contribution tracking
- ERC721 NFT rewards for savers
- Event logging for deposits/withdrawals

## Smart Contracts

### OurERC20.sol
- Standard ERC20 token implementation
- Used as the savings token

### OurERC721.sol
- NFT token for rewards
- Minted upon contributions

### OurPiggyBank.sol
- Main savings contract
- Handles deposits, withdrawals, and NFT minting
- Implements time-lock and target amount features

## Testing

Tests written in TypeScript using Hardhat framework covering:
- Contract deployment
- Deposit functionality
- Withdrawal restrictions
- Target amount validation
- Manager access control
- ERC721 minting
- Event emissions

Run tests:
```bash
npx hardhat test