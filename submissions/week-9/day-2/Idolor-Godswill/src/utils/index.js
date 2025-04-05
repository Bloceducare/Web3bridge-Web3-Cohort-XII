import { ethers } from "ethers";

export const getReadOnlyProvider = () => {
  const alchemyKey = import.meta.env.VITE_ALCHEMY_API_KEY;
  if (!alchemyKey) {
    throw new Error("Alchemy API key not found in environment variables");
  }
  return new ethers.providers.JsonRpcProvider(
    `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`
  );
};

// You can also use this alternative if you have issues with the above
// export const getReadOnlyProvider = () => {
//   return new ethers.JsonRpcProvider("https://mainnet.infura.io/v3/YOUR_INFURA_KEY");
// };

// Common Uniswap V2 Pairs for testing
export const EXAMPLE_PAIRS = {
  "ETH-USDC": "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc",
  "ETH-USDT": "0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852",
  "WBTC-ETH": "0xBb2b8038a1640196FbE3e38816F3e67Cba72D940"
};