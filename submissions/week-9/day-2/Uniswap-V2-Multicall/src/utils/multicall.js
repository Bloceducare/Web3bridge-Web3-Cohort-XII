// File: src/utils/multicall.js
import { ethers } from 'ethers';

// Multicall V1 ABI
const MULTICALL_ABI = [
  {
    "constant": false,
    "inputs": [
      {
        "components": [
          {
            "name": "target",
            "type": "address"
          },
          {
            "name": "callData",
            "type": "bytes"
          }
        ],
        "name": "calls",
        "type": "tuple[]"
      }
    ],
    "name": "aggregate",
    "outputs": [
      {
        "name": "blockNumber",
        "type": "uint256"
      },
      {
        "name": "returnData",
        "type": "bytes[]"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Ethereum Mainnet Multicall V1 address
const MULTICALL_ADDRESS = '0xeefba1e63905ef1d7acba5a8513c70307c1ce441';

// ERC20 ABI (for token data)
export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

// Uniswap V2 Pair ABI
export const UNISWAP_V2_PAIR_ABI = [
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function totalSupply() external view returns (uint256)"
];

// Create an Ethereum provider
export const getProvider = () => {
  // Using Infura as provider
  return new ethers.JsonRpcProvider("https://eth.llamarpc.com");
};

// Multicall function that bundles multiple calls into a single request
export const multicall = async (calls) => {
  try {
    const provider = getProvider();
    const multicallContract = new ethers.Contract(
      MULTICALL_ADDRESS,
      MULTICALL_ABI,
      provider
    );

    // Transform calls into the format expected by Multicall V1
    const callData = calls.map(({ address, abi, functionName, params = [] }) => {
      const contract = new ethers.Contract(address, abi, provider);
      const callData = contract.interface.encodeFunctionData(functionName, params);
      return {
        target: address,
        callData
      };
    });

    // Execute the multicall
    const { returnData } = await multicallContract.aggregate(callData);

    // Decode the return data
    return returnData.map((data, i) => {
      const contract = new ethers.Contract(calls[i].address, calls[i].abi, provider);
      return contract.interface.decodeFunctionResult(calls[i].functionName, data);
    });
  } catch (error) {
    console.error("Multicall error:", error);
    throw new Error(`Multicall failed: ${error.message}`);
  }
};

// Fetch Uniswap V2 pair data
export const fetchPairData = async (pairAddress) => {
  try {
    console.log(`Fetching data for pair: ${pairAddress}`);
    
    // First batch: Get token addresses, reserves, and total supply
    const basicCalls = [
      {
        address: pairAddress,
        abi: UNISWAP_V2_PAIR_ABI,
        functionName: "token0"
      },
      {
        address: pairAddress,
        abi: UNISWAP_V2_PAIR_ABI,
        functionName: "token1"
      },
      {
        address: pairAddress,
        abi: UNISWAP_V2_PAIR_ABI,
        functionName: "getReserves"
      },
      {
        address: pairAddress,
        abi: UNISWAP_V2_PAIR_ABI,
        functionName: "totalSupply"
      }
    ];

    console.log("Executing basic multicall...");
    const basicResults = await multicall(basicCalls);
    
    const token0Address = basicResults[0][0];
    const token1Address = basicResults[1][0];
    const reserves = basicResults[2];
    const totalSupply = basicResults[3][0];

    console.log(`Token0 Address: ${token0Address}`);
    console.log(`Token1 Address: ${token1Address}`);
    
    // Second batch: Fetch token details
    const tokenDetailsCalls = [
      // Token0 details
      {
        address: token0Address,
        abi: ERC20_ABI,
        functionName: "name"
      },
      {
        address: token0Address,
        abi: ERC20_ABI,
        functionName: "symbol"
      },
      {
        address: token0Address,
        abi: ERC20_ABI,
        functionName: "decimals"
      },
      // Token1 details
      {
        address: token1Address,
        abi: ERC20_ABI,
        functionName: "name"
      },
      {
        address: token1Address,
        abi: ERC20_ABI,
        functionName: "symbol"
      },
      {
        address: token1Address,
        abi: ERC20_ABI,
        functionName: "decimals"
      }
    ];

    console.log("Executing token details multicall...");
    const tokenDetails = await multicall(tokenDetailsCalls);

    // Calculate price ratio
    const token0Decimals = tokenDetails[2][0];
    const token1Decimals = tokenDetails[5][0];
    
    const reserve0Adjusted = ethers.utils.formatUnits(reserves[0], token0Decimals);
    const reserve1Adjusted = ethers.utils.formatUnits(reserves[1], token1Decimals);
    
    const price0 = parseFloat(reserve1Adjusted) / parseFloat(reserve0Adjusted);
    const price1 = parseFloat(reserve0Adjusted) / parseFloat(reserve1Adjusted);

    console.log("Data retrieval complete");
    
    return {
      pairAddress,
      token0: {
        address: token0Address,
        name: tokenDetails[0][0],
        symbol: tokenDetails[1][0],
        decimals: tokenDetails[2][0]
      },
      token1: {
        address: token1Address,
        name: tokenDetails[3][0],
        symbol: tokenDetails[4][0],
        decimals: tokenDetails[5][0]
      },
      reserves: {
        reserve0: reserves[0],
        reserve1: reserves[1],
        blockTimestampLast: reserves[2]
      },
      prices: {
        token0Price: price0.toFixed(6),
        token1Price: price1.toFixed(6)
      },
      totalSupply: totalSupply.toString()
    };
  } catch (error) {
    console.error("Error fetching pair data:", error);
    throw new Error(`Failed to fetch pair data: ${error.message}`);
  }
};