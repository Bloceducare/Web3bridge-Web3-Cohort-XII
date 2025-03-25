# UniSwapV2 Pair Explorer

A modern web application for exploring Uniswap V2 trading pairs. Built with React, Vite, and Chakra UI.

# Features

-  Search any Uniswap V2 pair by contract address
-  View detailed token information and reserves
-  Modern, responsive UI
- Fast data fetching using multicall
- Secure address validation

## Tech Stack

- React 18
- Vite
- Chakra UI
- Ethers.js
- Uniswap V2 Protocol

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/ObiamakaMaria/UniSwapV2_Interaction_Dapp.git
cd UniSwapV2_Interaction_Dapp
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file and add your Infura API key:
```env
VITE_INFURA_API_KEY=your_infura_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open `http://localhost:5173` in your browser

## Usage

1. Enter a Uniswap V2 pair contract address
2. Click "Fetch Data" to view:
   - Token details (name, symbol, decimals)
   - Current reserves
   - LP token supply
   - Last update timestamp


## License

UnLicensed

