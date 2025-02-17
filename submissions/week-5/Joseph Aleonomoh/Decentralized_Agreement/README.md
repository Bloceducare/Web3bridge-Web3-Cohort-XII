# Smart Contract Escrow Agreement System

A decentralized escrow system for creating and managing agreements using ERC20 tokens and NFTs on the Ethereum blockchain. The system uses NFTs as immutable proof of agreement signing, while tokens are held in escrow until signing conditions are met.

## Overview

The system implements a trustless escrow mechanism where:
- Agreement creators specify terms and required token amounts
- Signers deposit tokens into the agreement contract (escrow)
- Upon successful signing, an NFT is minted as an immutable record of the agreement
- Tokens are automatically transferred to the agreement creator when signed

Core components:
- `Token`: An ERC20 token contract for handling escrow payments
- `AgreementNFT`: An ERC721 contract providing proof of signed agreements
- `Agreement`: The escrow contract that holds tokens and verifies signing
- `AgreementFactory`: A factory contract that deploys and manages escrow instances

## Features

- Create escrow agreements with customizable names and deposit amounts
- Secure token holding in escrow until signing is complete
- NFTs minted as permanent, verifiable proof of agreement signing
- Automatic token transfer to agreement creator upon successful signing
- Factory pattern for easy escrow deployment and management

## Smart Contracts

### Token Contract
- ERC20-compliant token used for escrow deposits
- Includes minting functionality (restricted to owner)
- Inherits from OpenZeppelin's ERC20 and Ownable contracts

### AgreementNFT Contract
- ERC721-compliant NFT representing signed agreements
- Minted upon successful agreement signing
- Serves as an immutable record of completed agreements
- Cannot be transferred or duplicated for the same agreement

### Agreement Contract
- Acts as the escrow holder for deposited tokens
- Verifies signing conditions and manages token transfers
- Mints NFT to signer as proof of agreement completion
- Maintains signing status and prevents duplicate signing

### AgreementFactory Contract
- Deploys new escrow agreements and associated NFT contracts
- Maintains registry of all deployed escrow contracts
- Handles initial token deposit and signing verification
- Manages NFT minting upon successful signing

## Installation

```bash
npm install
```

## Testing

The system includes comprehensive tests covering all major functionality:

```bash
npx hardhat test
```

Key test scenarios include:
- Contract deployment
- Escrow creation
- Token deposit and custody
- Agreement signing and NFT minting
- Error handling for invalid operations
- Verification of signing status

## Deployment

Use the provided deployment script to deploy the contracts:

```bash
npx hardhat run scripts/deploy.ts
```

The script will:
1. Deploy the Token contract
2. Deploy the AgreementFactory contract
3. Create a sample escrow agreement
4. Process a sample signing and NFT minting (optional)

## Usage

### Creating an Escrow Agreement

```javascript
const depositAmount = ethers.parseUnits("100", 18);
await agreementFactory.createAgreement("Rental Escrow", depositAmount);
```

### Signing and Receiving Proof

```javascript
await token.approve(agreementFactory.address, depositAmount);
await agreementFactory.signAgreement(agreementOwner);
```

## Agreement Signing Flow

1. Agreement creator deploys new escrow contract via factory
2. Signer approves token spending for the required amount
3. Tokens are transferred to the escrow contract
4. Agreement is signed and verified
5. NFT is minted to signer as proof of signing
6. Tokens are released to agreement creator
7. Agreement is marked as completed

## Verification

The NFT serves as permanent proof of signing, allowing:
- On-chain verification of agreement signing
- Immutable record of completed agreements
- Proof of signing that cannot be forged or duplicated
- Historical tracking of agreement participation

## Error Handling

The system includes several custom errors:
- `Unauthorized`: Access control violation
- `InvalidAmount`: Invalid deposit amount
- `InvalidNftBalance`: NFT minting verification failed
- `AlreadySigned`: Attempt to sign an agreement multiple times

## Events

The system emits events for important operations:
- `AgreementCreated`: When a new escrow agreement is created
- `AgreementSigned`: When an agreement is signed and NFT is minted
- `Agreed`: When the escrow completes and signing is recorded


## Requirements

- Solidity ^0.8.28
- OpenZeppelin Contracts
- Hardhat development environment

