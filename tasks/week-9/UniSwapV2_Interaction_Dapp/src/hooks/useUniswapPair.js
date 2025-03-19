import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { UNISWAP_V2_PAIR_ABI, ERC20_ABI } from '../utils/UniswapV2PairABI';
import { multicall } from '../utils/multicall';

export function useUniswapPair(pairAddress) {
  const [pairData, setPairData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPairData() {
      if (!pairAddress) return;

      setLoading(true);
      setError(null);

      try {
        let checksummedPairAddress;
        try {
          checksummedPairAddress = ethers.getAddress(pairAddress);
        } catch (err) {
          if (err.code === 'INVALID_ARGUMENT') {
            if (!pairAddress.startsWith('0x')) {
              setError('Address must start with "0x"');
            } else if (pairAddress.length !== 42) {
              setError('Address must be 42 characters long (0x + 40 hex characters)');
            } else if (!/^0x[a-fA-F0-9]{40}$/.test(pairAddress)) {
              setError('Address contains invalid characters. Only hex characters (0-9, a-f) are allowed');
            } else {
              setError('Invalid Ethereum address format');
            }
          } else {
            setError('Failed to validate address');
          }
          return;
        }
        
        const provider = new ethers.JsonRpcProvider(`https://mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_API_KEY}`);
        
        const pairInterface = new ethers.Interface(UNISWAP_V2_PAIR_ABI);
        const erc20Interface = new ethers.Interface(ERC20_ABI);

        const pairCalls = [
          {
            target: checksummedPairAddress,
            callData: pairInterface.encodeFunctionData('token0')
          },
          {
            target: checksummedPairAddress,
            callData: pairInterface.encodeFunctionData('token1')
          },
          {
            target: checksummedPairAddress,
            callData: pairInterface.encodeFunctionData('getReserves')
          },
          {
            target: checksummedPairAddress,
            callData: pairInterface.encodeFunctionData('totalSupply')
          }
        ];

        const { returnData: pairReturnData } = await multicall.aggregate.staticCall(provider, pairCalls);
        
        const token0Address = pairInterface.decodeFunctionResult('token0', pairReturnData[0]);
        const token1Address = pairInterface.decodeFunctionResult('token1', pairReturnData[1]);
        const reserves = pairInterface.decodeFunctionResult('getReserves', pairReturnData[2]);
        const totalSupply = pairInterface.decodeFunctionResult('totalSupply', pairReturnData[3]);

        const checksummedToken0Address = ethers.getAddress(token0Address[0]);
        const checksummedToken1Address = ethers.getAddress(token1Address[0]);

        const token0Calls = [
          {
            target: checksummedToken0Address,
            callData: erc20Interface.encodeFunctionData('name')
          },
          {
            target: checksummedToken0Address,
            callData: erc20Interface.encodeFunctionData('symbol')
          },
          {
            target: checksummedToken0Address,
            callData: erc20Interface.encodeFunctionData('decimals')
          }
        ];

        const token1Calls = [
          {
            target: checksummedToken1Address,
            callData: erc20Interface.encodeFunctionData('name')
          },
          {
            target: checksummedToken1Address,
            callData: erc20Interface.encodeFunctionData('symbol')
          },
          {
            target: checksummedToken1Address,
            callData: erc20Interface.encodeFunctionData('decimals')
          }
        ];

        const { returnData: token0ReturnData } = await multicall.aggregate.staticCall(provider, token0Calls);
        const { returnData: token1ReturnData } = await multicall.aggregate.staticCall(provider, token1Calls);

        const token0Name = erc20Interface.decodeFunctionResult('name', token0ReturnData[0]);
        const token0Symbol = erc20Interface.decodeFunctionResult('symbol', token0ReturnData[1]);
        const token0Decimals = erc20Interface.decodeFunctionResult('decimals', token0ReturnData[2]);

        const token1Name = erc20Interface.decodeFunctionResult('name', token1ReturnData[0]);
        const token1Symbol = erc20Interface.decodeFunctionResult('symbol', token1ReturnData[1]);
        const token1Decimals = erc20Interface.decodeFunctionResult('decimals', token1ReturnData[2]);

        setPairData({
          token0: {
            address: checksummedToken0Address,
            name: token0Name[0],
            symbol: token0Symbol[0],
            decimals: token0Decimals[0]
          },
          token1: {
            address: checksummedToken1Address,
            name: token1Name[0],
            symbol: token1Symbol[0],
            decimals: token1Decimals[0]
          },
          reserves: {
            reserve0: reserves[0],
            reserve1: reserves[1],
            timestamp: reserves[2]
          },
          totalSupply: totalSupply[0]
        });
      } catch (err) {
        console.error('Error fetching pair data:', err);
        if (err.message.includes('execution reverted')) {
          setError('This address is not a valid Uniswap V2 pair contract');
        } else if (err.message.includes('network')) {
          setError('Network error. Please check your connection and try again');
        } else {
          setError('Failed to fetch pair data. Please try again');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchPairData();
  }, [pairAddress]);

  return { pairData, loading, error };
}