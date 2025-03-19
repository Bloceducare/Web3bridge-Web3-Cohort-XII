// src/hooks/usePairData.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { MULTICALL_ADDRESS, MULTICALL_ABI, UNISWAP_V2_PAIR_ABI, ERC20_ABI } from '../constants/abis';

export function usePairData(pairAddress) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!pairAddress || !ethers.utils.isAddress(pairAddress)) {
      setError("Please enter a valid Ethereum address");
      return;
    }

    const fetchPairData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Connect to Ethereum
        const provider = new ethers.providers.JsonRpcProvider(
          "https://eth-mainnet.g.alchemy.com/v2/9S1GrOW9pT7Gny6HilxN_JsdeiZIWxyI"
        );
        
        // Initialize multicall contract
        const multicall = new ethers.Contract(
          MULTICALL_ADDRESS,
          MULTICALL_ABI,
          provider
        );

        // Create interface to encode function calls
        const pairInterface = new ethers.utils.Interface(UNISWAP_V2_PAIR_ABI);
        
        // Prepare calls for pair data
        const calls = [
          {
            target: pairAddress,
            callData: pairInterface.encodeFunctionData("token0")
          },
          {
            target: pairAddress,
            callData: pairInterface.encodeFunctionData("token1")
          },
          {
            target: pairAddress,
            callData: pairInterface.encodeFunctionData("getReserves")
          },
          {
            target: pairAddress,
            callData: pairInterface.encodeFunctionData("totalSupply")
          }
        ];

        // Execute multicall
        const [, returnData] = await multicall.aggregate(calls);
        
        // Decode responses
        const token0Address = pairInterface.decodeFunctionResult("token0", returnData[0])[0];
        const token1Address = pairInterface.decodeFunctionResult("token1", returnData[1])[0];
        const reserves = pairInterface.decodeFunctionResult("getReserves", returnData[2]);
        const totalSupply = pairInterface.decodeFunctionResult("totalSupply", returnData[3])[0];

        // Now fetch token details using multicall
        const erc20Interface = new ethers.utils.Interface(ERC20_ABI);
        
        // Prepare calls for token details
        const tokenCalls = [
          // Token0 details
          {
            target: token0Address,
            callData: erc20Interface.encodeFunctionData("name")
          },
          {
            target: token0Address,
            callData: erc20Interface.encodeFunctionData("symbol")
          },
          {
            target: token0Address,
            callData: erc20Interface.encodeFunctionData("decimals")
          },
          // Token1 details
          {
            target: token1Address,
            callData: erc20Interface.encodeFunctionData("name")
          },
          {
            target: token1Address,
            callData: erc20Interface.encodeFunctionData("symbol")
          },
          {
            target: token1Address,
            callData: erc20Interface.encodeFunctionData("decimals")
          }
        ];

        // Execute multicall for token details
        const [, tokenReturnData] = await multicall.aggregate(tokenCalls);
        
        // Decode token responses
        const token0 = {
          address: token0Address,
          name: erc20Interface.decodeFunctionResult("name", tokenReturnData[0])[0],
          symbol: erc20Interface.decodeFunctionResult("symbol", tokenReturnData[1])[0],
          decimals: erc20Interface.decodeFunctionResult("decimals", tokenReturnData[2])[0],
        };

        const token1 = {
          address: token1Address,
          name: erc20Interface.decodeFunctionResult("name", tokenReturnData[3])[0],
          symbol: erc20Interface.decodeFunctionResult("symbol", tokenReturnData[4])[0],
          decimals: erc20Interface.decodeFunctionResult("decimals", tokenReturnData[5])[0],
        };

        // Calculate reserves in human-readable format
        const reserve0 = ethers.utils.formatUnits(
          reserves._reserve0,
          token0.decimals
        );
        const reserve1 = ethers.utils.formatUnits(
          reserves._reserve1,
          token1.decimals
        );

        // Format total supply
        const formattedTotalSupply = ethers.utils.formatEther(totalSupply);

        // Calculate price
        const price0 = reserve1 / reserve0;
        const price1 = reserve0 / reserve1;

        // Set the complete data
        setData({
          pairAddress,
          token0,
          token1,
          reserves: {
            reserve0: reserves._reserve0.toString(),
            reserve1: reserves._reserve1.toString(),
            blockTimestampLast: reserves._blockTimestampLast,
            formatted: {
              reserve0,
              reserve1
            }
          },
          totalSupply: {
            raw: totalSupply.toString(),
            formatted: formattedTotalSupply
          },
          prices: {
            price0,
            price1
          }
        });
      } catch (err) {
        console.error("Error fetching pair data:", err);
        setError("Failed to fetch pair data. Please check the address and try again.");
      } finally {
        setLoading(false);
      }
    };

    if (pairAddress && ethers.utils.isAddress(pairAddress)) {
      fetchPairData();
    }
  }, [pairAddress]);

  return { loading, error, data };
}