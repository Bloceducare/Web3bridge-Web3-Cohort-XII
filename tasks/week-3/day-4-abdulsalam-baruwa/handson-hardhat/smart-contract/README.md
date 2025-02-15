# Hands-on Practice with Hardhat

## Task Details

**Task Name:** Hands-on Practice with Hardhat  
**Task Description:** Deploy the `Ballot.sol` smart contract to 4 different chains using Hardhat:

- Amoy
- Lisk Sepolia
- Sepolia (verified the contract)
- Meter

## Deployed Contract Addresses

- **Amoy:** `0x563093915cc3F436632c849bad3E8517a926bC09`
- **Lisk Sepolia:** `0x563093915cc3F436632c849bad3E8517a926bC09`
- **Sepolia:** `0xeDD0c78a283D2a652dEcd7aD9e06F3fc7b958802` (Verified)
- **Meter:** `0x3D2e2a1F09228F99969688F69c1825256099e0E4`

## Verified Contract

[View Verified Contract on Sepolia](https://sepolia.etherscan.io/address/0xeDD0c78a283D2a652dEcd7aD9e06F3fc7b958802#code)

## Deployment Script

Used a [deploy](./scripts/deploy.ts) script to deploy the contract to the Meter network.

Command: ``` npx hardhat run scripts/deploy.ts --network meter ```
