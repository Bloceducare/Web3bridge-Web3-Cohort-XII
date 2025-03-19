import { ethers } from 'ethers';
import { aggregate } from '@makerdao/multicall'; // Named import instead of default

// Uniswap V2 Pair ABI (minimal subset for required calls)
const PAIR_ABI = [
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function getReserves() view returns (uint112, uint112, uint32)',
  'function totalSupply() view returns (uint256)',
];

// ERC20 Token ABI (minimal subset)
const TOKEN_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
];

export interface PairData {
  token0: { address: string; name: string; symbol: string; decimals: number };
  token1: { address: string; name: string; symbol: string; decimals: number };
  reserves: { reserve0: string; reserve1: string };
  totalSupply: string;
}

export async function fetchPairData(pairAddress: string): Promise<PairData> {
  const rpcUrl = import.meta.env.VITE_INFURA_KEY;
  // VITE_INFURA_KEY
  if (!rpcUrl) {
    throw new Error('VITE_INFURA_KEY is not defined in .env');
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);

  // Multicall configuration
  const multicallConfig = {
    rpcUrl,
    multicallAddress: '0xeefba1e63905ef1d7acba5a8513c70307c1ce441', // Ethereum mainnet Multicall address
  };

  // Define the calls to the pair contract
  const pairCalls = [
    { target: pairAddress, call: ['token0()(address)'], returns: [['token0']] },
    { target: pairAddress, call: ['token1()(address)'], returns: [['token1']] },
    {
      target: pairAddress,
      call: ['getReserves()(uint112,uint112,uint32)'],
      returns: [['reserve0'], ['reserve1'], ['blockTimestampLast']],
    },
    { target: pairAddress, call: ['totalSupply()(uint256)'], returns: [['totalSupply']] },
  ];

  // Execute Multicall for pair data
  const pairResult = await aggregate(pairCalls, multicallConfig);

  const token0Address = pairResult.results.transformed.token0 as string;
  const token1Address = pairResult.results.transformed.token1 as string;

  // Define calls for token details
  const tokenCalls = [
    { target: token0Address, call: ['name()(string)'], returns: [['token0Name']] },
    { target: token0Address, call: ['symbol()(string)'], returns: [['token0Symbol']] },
    { target: token0Address, call: ['decimals()(uint8)'], returns: [['token0Decimals']] },
    { target: token1Address, call: ['name()(string)'], returns: [['token1Name']] },
    { target: token1Address, call: ['symbol()(string)'], returns: [['token1Symbol']] },
    { target: token1Address, call: ['decimals()(uint8)'], returns: [['token1Decimals']] },
  ];

  // Execute Multicall for token data
  const tokenResult = await aggregate(tokenCalls, multicallConfig);

  // Format the results
  return {
    token0: {
      address: token0Address,
      name: tokenResult.results.transformed.token0Name as string,
      symbol: tokenResult.results.transformed.token0Symbol as string,
      decimals: tokenResult.results.transformed.token0Decimals as number,
    },
    token1: {
      address: token1Address,
      name: tokenResult.results.transformed.token1Name as string,
      symbol: tokenResult.results.transformed.token1Symbol as string,
      decimals: tokenResult.results.transformed.token1Decimals as number,
    },
    reserves: {
      reserve0: (pairResult.results.transformed.reserve0 as ethers.BigNumberish).toString(),
      reserve1: (pairResult.results.transformed.reserve1 as ethers.BigNumberish).toString(),
    },
    totalSupply: (pairResult.results.transformed.totalSupply as ethers.BigNumberish).toString(),
  };
}