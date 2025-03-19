# Uniswap V2 Pair Data Retrieval

## Overview
This project retrieves Uniswap V2 pair details using Multicall and displays token reserves, token addresses, and other relevant information. It is built with Vite, React, Tailwind CSS, and Ethers.js v6.

## Features
- Fetches Uniswap V2 Pair details via Multicall.
- Displays token reserves and addresses.
- Validates Ethereum addresses before fetching data.
- Uses `ethers.js v6` for blockchain interactions.

## Installation

### Prerequisites
- Node.js (>= 16)
- Yarn or npm

### Steps
1. Clone the repository:
   ```sh
   git clone https://github.com/7maylord/uniswap-v2-explorer.git
   cd uniswap-v2-explorer
   ```

2. Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory and add your Ethereum provider:
   ```env
    VITE_MULTICALL_CONTRACT_ADDRESS=0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696
    VITE_MAINNET_RPC=<YOUR_ALCHEMY_OR_INFURA_RPC_URL>
    VITE_FACTORY_CONTRACT_ADDRESS=0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f
   ```

4. Start the development server:
   ```sh
   npm run dev
   # or
   yarn dev
   ```

## Usage
1. Enter a Uniswap V2 Pair contract address in the input field.
2. Click the "Fetch" button.
3. View details such as token addresses and reserves.

## Technologies Used
- **React**: For UI components.
- **Vite**: Fast build tool.
- **Tailwind CSS**: Styling framework.
- **Ethers.js v6**: For Ethereum blockchain interactions.
- **Multicall2**: Efficiently fetches multiple on-chain values in a single call.


## Troubleshooting
- **Invalid address error**: Ensure you enter a valid Ethereum address.
- **Data not loading**: Verify that you are querying a valid Uniswap V2 pair.
- **Network errors**: Ensure your provider API key is correctly set in `.env`.

## License
This project is licensed under the MIT License.

## Author
Developed by **[MayLord](https://github.com/7maylord)**. Feel free to contribute and improve the project!

---

Happy coding! 🚀

