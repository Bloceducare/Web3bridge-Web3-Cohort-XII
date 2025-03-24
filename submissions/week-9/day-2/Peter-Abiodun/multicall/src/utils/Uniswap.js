// src/utils/Uniswap.js
import { ethers, Interface, Contract, JsonRpcProvider, formatUnits } from 'ethers';

// ABIs
//Human readable Abi
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)'
];

const PAIR_ABI = [
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function totalSupply() view returns (uint256)',
  'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
];

// Multicall ABI and address
const MULTICALL_ABI = [
  'function aggregate(tuple(address target, bytes callData)[] calls) view returns (uint256 blockNumber, bytes[] returnData)'
];
const MULTICALL_ADDRESS = '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696'; // Ethereum Mainnet

// Setup provider
const provider = new JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/EzkLGxQzDcyT-PU8k-DbYL6iAIB1l1TE');

// Helper for encoding function calls
function encodeFunctionCall(contractInterface, functionName, args = []) {
  return contractInterface.encodeFunctionData(functionName, args);
}

// Helper for decoding function results
function decodeFunctionResult(contractInterface, functionName, data) {
  return contractInterface.decodeFunctionResult(functionName, data);
}

// Format reserves with proper decimals
export function formatReserves(amount, decimals) {
  // Check if amount is null or undefined
  if (amount === null || amount === undefined) {
    return "0";
  }
  
  // Make sure decimals is a number
  const decimalValue = Number(decimals);
  
  // Check if it's a valid number before using formatUnits
  if (isNaN(decimalValue)) {
    console.error("Invalid decimal value:", decimals);
    return "0";
  }
  
  try {
    return formatUnits(amount, decimalValue);
  } catch (error) {
    console.error("Error formatting amount:", error);
    return "0";
  }
}

// Main function to fetch pair data
export async function fetchPairData(pairAddress) {
  const pairInterface = new Interface(PAIR_ABI);
  const erc20Interface = new Interface(ERC20_ABI);
  
  const multicall = new Contract(MULTICALL_ADDRESS, MULTICALL_ABI, provider);
  
  // Step 1: Get token addresses and reserves
  const calls = [
    {
      target: pairAddress,
      callData: encodeFunctionCall(pairInterface, 'token0')
    },
    {
      target: pairAddress,
      callData: encodeFunctionCall(pairInterface, 'token1')
    },
    {
      target: pairAddress,
      callData: encodeFunctionCall(pairInterface, 'getReserves')
    },
    {
      target: pairAddress,
      callData: encodeFunctionCall(pairInterface, 'totalSupply')
    }
  ];
  
  const [, results] = await multicall.aggregate(calls);
  
  const token0Address = decodeFunctionResult(pairInterface, 'token0', results[0])[0];
  const token1Address = decodeFunctionResult(pairInterface, 'token1', results[1])[0];
  const reserves = decodeFunctionResult(pairInterface, 'getReserves', results[2]);
  const totalSupply = decodeFunctionResult(pairInterface, 'totalSupply', results[3])[0];
  
  // Step 2: Get token details
  const tokenCalls = [
    // Token0 details
    {
      target: token0Address,
      callData: encodeFunctionCall(erc20Interface, 'name')
    },
    {
      target: token0Address,
      callData: encodeFunctionCall(erc20Interface, 'symbol')
    },
    {
      target: token0Address,
      callData: encodeFunctionCall(erc20Interface, 'decimals')
    },
    // Token1 details
    {
      target: token1Address,
      callData: encodeFunctionCall(erc20Interface, 'name')
    },
    {
      target: token1Address,
      callData: encodeFunctionCall(erc20Interface, 'symbol')
    },
    {
      target: token1Address,
      callData: encodeFunctionCall(erc20Interface, 'decimals')
    }
  ];
  
  const [, tokenResults] = await multicall.aggregate(tokenCalls);
  
  const token0 = {
    address: token0Address,
    name: decodeFunctionResult(erc20Interface, 'name', tokenResults[0])[0],
    symbol: decodeFunctionResult(erc20Interface, 'symbol', tokenResults[1])[0],
    decimals: decodeFunctionResult(erc20Interface, 'decimals', tokenResults[2])[0]
  };
  
  const token1 = {
    address: token1Address,
    name: decodeFunctionResult(erc20Interface, 'name', tokenResults[3])[0],
    symbol: decodeFunctionResult(erc20Interface, 'symbol', tokenResults[4])[0],
    decimals: decodeFunctionResult(erc20Interface, 'decimals', tokenResults[5])[0]
  };
  
  return {
    pairAddress,
    token0,
    token1,
    reserves,
    totalSupply
  };
}