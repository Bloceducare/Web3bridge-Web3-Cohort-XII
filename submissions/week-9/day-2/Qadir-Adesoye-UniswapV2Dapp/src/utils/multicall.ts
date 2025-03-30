// Use ethers v6 compatible imports
import { ethers } from 'ethers';
import IUniswapV2PairABI from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import IERC20ABI from '@uniswap/v2-periphery/build/IERC20.json';
import { PairData, TokenData } from '../types';

// Initialize provider using the RPC URL from .env
const RPC_URL = import.meta.env.VITE_ETHEREUM_RPC_URL;
const provider = new ethers.JsonRpcProvider(RPC_URL);

export async function fetchPairData(pairAddress: string): Promise<PairData> {
  // Validate address
  if (!ethers.isAddress(pairAddress)) {
    throw new Error('Invalid Ethereum address');
  }

  try {
    const pairContract = new ethers.Contract(pairAddress, IUniswapV2PairABI.abi, provider);

    // Batch calls using Promise.all
    const [token0Address, token1Address, reserves, totalSupply] = await Promise.all([
      pairContract.token0(),
      pairContract.token1(),
      pairContract.getReserves(),
      pairContract.totalSupply(),
    ]);

    const token0Contract = new ethers.Contract(token0Address, IERC20ABI.abi, provider);
    const token1Contract = new ethers.Contract(token1Address, IERC20ABI.abi, provider);

    const [token0Name, token0Symbol, token0Decimals, token1Name, token1Symbol, token1Decimals] = await Promise.all([
      token0Contract.name(),
      token0Contract.symbol(),
      token0Contract.decimals(),
      token1Contract.name(),
      token1Contract.symbol(),
      token1Contract.decimals(),
    ]);

    // Format the data
    const token0: TokenData = {
      address: token0Address,
      name: token0Name,
      symbol: token0Symbol,
      decimals: token0Decimals,
    };

    const token1: TokenData = {
      address: token1Address,
      name: token1Name,
      symbol: token1Symbol,
      decimals: token1Decimals,
    };

    return {
      pairAddress,
      token0,
      token1,
      reserves0: ethers.formatUnits(reserves[0], token0Decimals),
      reserves1: ethers.formatUnits(reserves[1], token1Decimals),
      totalSupply: ethers.formatUnits(totalSupply, 18),
    };
  } catch (error: unknown) {
    // Type-safe error handling
    const errMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`Failed to fetch pair data: ${errMessage}`);
  }
}