import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { MULTICALL_ADDRESS, MULTICALL_ABI, UNISWAP_V2_PAIR_ABI, ERC20_ABI } from '../ABI/abi';
import { getReadOnlyProvider } from '../utilis';
import { isAddress } from 'ethers';

// Create provider (Ethereum mainnet)
const provider = getReadOnlyProvider();

// Instantiate the multicall contract
const multicallContract = new ethers.Contract(
  MULTICALL_ADDRESS,
  MULTICALL_ABI,
  provider
);

export function useMulticall() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pairInfo, setPairInfo] = useState(null);

  const fetchPairInfo = useCallback(async (pairAddress) => {
    if (!isAddress(pairAddress)) {
      setError('Invalid Ethereum address');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      // Create interfaces
      const pairInterface = new ethers.Interface(UNISWAP_V2_PAIR_ABI);
      const erc20Interface = new ethers.Interface(ERC20_ABI);
      
      // Prepare calls for pair info
      const pairCalls = [
        {
          target: pairAddress,
          callData: pairInterface.encodeFunctionData('token0')
        },
        {
          target: pairAddress,
          callData: pairInterface.encodeFunctionData('token1')
        },
        {
          target: pairAddress,
          callData: pairInterface.encodeFunctionData('getReserves')
        },
        {
          target: pairAddress,
          callData: pairInterface.encodeFunctionData('totalSupply')
        },
        {
          target: pairAddress,
          callData: pairInterface.encodeFunctionData('factory')
        }
      ];
      
      // Execute the first multicall to get token addresses
      const [, initialResults] = await multicallContract.aggregate(pairCalls);
      
      // Decode token addresses first
      const token0Address = pairInterface.decodeFunctionResult('token0', initialResults[0])[0];
      const token1Address = pairInterface.decodeFunctionResult('token1', initialResults[1])[0];
      
      // Prepare calls for token details
      const tokenDetailCalls = [
        // Token0 details
        {
          target: token0Address,
          callData: erc20Interface.encodeFunctionData('name')
        },
        {
          target: token0Address,
          callData: erc20Interface.encodeFunctionData('symbol')
        },
        {
          target: token0Address,
          callData: erc20Interface.encodeFunctionData('decimals')
        },
        // Token1 details
        {
          target: token1Address,
          callData: erc20Interface.encodeFunctionData('name')
        },
        {
          target: token1Address,
          callData: erc20Interface.encodeFunctionData('symbol')
        },
        {
          target: token1Address,
          callData: erc20Interface.encodeFunctionData('decimals')
        }
      ];
      
      // Execute second multicall for token details
      const [, tokenResults] = await multicallContract.aggregate(tokenDetailCalls);
      
      // Decode all results
      const reserves = pairInterface.decodeFunctionResult('getReserves', initialResults[2]);
      const totalSupply = pairInterface.decodeFunctionResult('totalSupply', initialResults[3])[0];
      const factory = pairInterface.decodeFunctionResult('factory', initialResults[4])[0];
      
      // Decode token0 details
      const token0Name = erc20Interface.decodeFunctionResult('name', tokenResults[0])[0];
      const token0Symbol = erc20Interface.decodeFunctionResult('symbol', tokenResults[1])[0];
      const token0Decimals = erc20Interface.decodeFunctionResult('decimals', tokenResults[2])[0];
      
      // Decode token1 details
      const token1Name = erc20Interface.decodeFunctionResult('name', tokenResults[3])[0];
      const token1Symbol = erc20Interface.decodeFunctionResult('symbol', tokenResults[4])[0];
      const token1Decimals = erc20Interface.decodeFunctionResult('decimals', tokenResults[5])[0];
      
      // Format the reserve amounts based on token decimals
      const reserve0 = ethers.formatUnits(reserves._reserve0, token0Decimals);
      const reserve1 = ethers.formatUnits(reserves._reserve1, token1Decimals);
      const formattedTotalSupply = ethers.formatEther(totalSupply);
      
      // Compile the results
      const result = {
        pairAddress,
        factory,
        token0: {
          address: token0Address,
          name: token0Name,
          symbol: token0Symbol,
          decimals: token0Decimals,
          reserve: reserve0
        },
        token1: {
          address: token1Address,
          name: token1Name,
          symbol: token1Symbol,
          decimals: token1Decimals,
          reserve: reserve1
        },
        totalSupply: formattedTotalSupply,
        blockTimestampLast: reserves._blockTimestampLast,
        lastUpdated: new Date().toISOString()
      };
      
      setPairInfo(result);
      console.log(result);

      return result;
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        pairAddress,
        stack: err.stack
      });
      setError(`Failed to fetch pair info: ${err.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    pairInfo,
    loading,
    error,
    fetchPairInfo
  };
}