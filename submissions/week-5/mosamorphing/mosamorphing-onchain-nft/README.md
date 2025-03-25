# Yosemite NFT

## Overview
Yosemite NFT is an ERC-721 stored directly on the blockchain

## Features
- Fully on-chain SVG-based NFT.
- ERC-721 compliant.
- Simple minting function allowing users to create a new NFT.
- Automatically generated metadata using Base64 encoding.

## Deployment Details
- **Contract Address on Amoy Polygon Testnet:** `0x661597c87d3365cCB4C88359b7Ff8DD0772fD58E`
- **OpenSea Testnet Link:** [here](https://testnets.opensea.io/assets/amoy/0x661597c87d3365ccb4c88359b7ff8dd0772fd58e/0/)

## Smart Contract
The contract is built using Solidity and leverages OpenZeppelin’s ERC-721 implementation. It includes:
- A minting function (`mint()`) that allows users to create a new token.
- A `tokenURI()` function that generates metadata and SVG artwork entirely on-chain.

## Minting an NFT
To mint an NFT, simply call the `mint()` function from an Ethereum-compatible wallet or script:

```solidity
contract.mint();
```

## Viewing the NFT Metadata
You can retrieve the metadata by calling the `tokenURI()` function with a valid token ID:

```solidity
contract.tokenURI(0);
```

This will return a Base64-encoded JSON object containing the metadata and SVG image.

## License
This project is licensed under the **UNLICENSED** license.