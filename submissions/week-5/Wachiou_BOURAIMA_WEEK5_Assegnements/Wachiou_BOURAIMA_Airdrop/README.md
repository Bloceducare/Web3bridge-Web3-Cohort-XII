# Airdrop Project

Welcome to the Airdrop project! This project is part of the Web3Bridge cohortXII, Week 5.

## Overview

The Airdrop project is designed to distribute tokens to a list of recipients. This README provides an overview of the project, setup instructions, and usage guidelines.

## Features

- Distribute tokens to multiple recipients
- Verify recipient addresses
- Track distribution status

## Setup

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/airdrop.git
    ```
2. Navigate to the project directory:
    ```bash
    cd airdrop
    ```
3. Install dependencies:
    ```bash
    npm install
    ```

## Usage

1. Configure the airdrop settings in `config.json`.
2. Run the airdrop script:
    ```bash
    npm run airdrop
    ```

# Deployment

1. Deploy the Airdrop contract:
    ```bash
    npx hardhat --network [the network] run scripts/script.ts

    ```
2. Verify the contract on Etherscan:
    ```bash

    npx hardhat verify --network holesky [contract address] [constructor argument1] [constructor argument2] [constructor argument3] [constructor argument3]

    ```

    OR

    ```bash
    npx hardhat --network [the network] verify --constructor-args arguments [contract address]
    ```

    

## Contributing

We welcome contributions! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License.

# Airdrop


contract deployed at 0x3712dAFA0104219452e6d5A5678884eedbbd4cda

etherscan link: https://holesky.etherscan.io/address/0x3712dAFA0104219452e6d5A5678884eedbbd4cda#code