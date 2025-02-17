# Uniswap Liquidity & Swap Test Scripts

## Overview
This project contains two Hardhat scripts that interact with the Uniswap V2 Router contract on Ethereum. These scripts allow you to:
- Remove liquidity from a Uniswap pool.
- Swap ETH for DAI using Uniswap.

## Prerequisites
Ensure you have the following installed and configured:
- [Node.js](https://nodejs.org/)
- [Hardhat](https://hardhat.org/)
- [Infura API Key](https://infura.io/) (if forking mainnet)
- A Hardhat project initialized with `@nomicfoundation/hardhat-toolbox`

## Setup
1. Clone this repository and install dependencies:
   ```sh
   npm install
   ```
2. Ensure your Hardhat node is running (forking mainnet recommended):
   ```sh
   npx hardhat node --fork https://mainnet.infura.io/v3/YOUR_INFURA_KEY
   ```

## Test Scripts

### 1️⃣ Remove Liquidity Script
This script impersonates an account holding USDC and DAI liquidity, removes liquidity from Uniswap, and transfers tokens back to the user.

#### **Usage:**
```sh
npx hardhat run scripts/removeLiquidity.js --network localhost
```

#### **Key Steps:**
- Impersonates an account with USDC and DAI liquidity.
- Funds the impersonated account with ETH for gas fees.
- Calls `removeLiquidity()` on Uniswap V2 Router.
- Transfers removed tokens back to the impersonated account.

### 2️⃣ Swap ETH for DAI Script
This script swaps ETH for DAI through the Uniswap V2 Router.

#### **Usage:**
```sh
npx hardhat run scripts/swapExactETHForTokens.js --network localhost
```

#### **Key Steps:**
- Fetches WETH address from Uniswap Router.
- Defines a swap path from WETH to DAI.
- Sends `0.1 ETH` to swap for at least `10 DAI`.
- Executes the swap using `swapExactETHForTokens()`.

## Notes
- The `removeLiquidity.js` script relies on an impersonated account with existing liquidity.
- Ensure your Hardhat node is properly forked from Ethereum mainnet to interact with real contracts.
- Adjust the token amounts and addresses as needed.
- The contract interface used (`IUniswapV2Router02`) supports both swap and liquidity functions.

## Troubleshooting
- If you see `Error: could not decode result data`, ensure your Hardhat node is properly forked.
- If `EADDRINUSE` occurs, terminate any previous Hardhat node process before starting a new one:
  ```sh
  taskkill /PID <PID> /F  # Windows
  kill -9 <PID>  # Mac/Linux
  ```

