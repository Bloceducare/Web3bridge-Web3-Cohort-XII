import { Contract, Interface } from 'ethers';
import { ethers } from 'ethers';
import MULTCALL_ABI from '../ABI/multicall.json';
import PAIR_ABI from '../ABI/UniswapV2.json';

const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
];

export const getPairData = async (pairAddress) => {
  const provider = new ethers.JsonRpcProvider(
    'https://eth-mainnet.g.alchemy.com/v2/no-tCXj1V0r5oeMGjUCqbOcWA-vmwA1P'
  );
  try {
    const multicall = new Contract(
      '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
      MULTCALL_ABI,
      provider
    );

    const pairContractInterface = new Interface(PAIR_ABI);

    const calls = [
      {
        target: pairAddress,
        callData: pairContractInterface.encodeFunctionData('token0', []),
      },
      {
        target: pairAddress,
        callData: pairContractInterface.encodeFunctionData('token1', []),
      },
      {
        target: pairAddress,
        callData: pairContractInterface.encodeFunctionData('getReserves', []),
      },
      {
        target: pairAddress,
        callData: pairContractInterface.encodeFunctionData('totalSupply', []),
      },
    ];

    const results = await multicall.aggregate.staticCall(calls);
    const resultsArray = results.returnData.map((data) =>
      typeof data === 'bigint' ? data.toString() : data
    );
    console.log('resultsArray:', resultsArray);

    const [token0, token1, reserves, totalSupply] = resultsArray;

    const token0Address = pairContractInterface.decodeFunctionResult(
      'token0',
      token0
    );
    const token1Address = pairContractInterface.decodeFunctionResult(
      'token1',
      token1
    );
    const reservesData = pairContractInterface.decodeFunctionResult(
      'getReserves',
      reserves
    );
    const totalSupplyValue = pairContractInterface.decodeFunctionResult(
      'totalSupply',
      totalSupply
    );
    console.log('token0Address:', token0Address[0]);
    console.log('token1Address:', token1Address[0]);
    console.log('reservesData:', reservesData[0]);
    console.log('totalSupplyValue:', totalSupplyValue[0]);

    const tokenContractsInterface = new Interface(ERC20_ABI);
    const tokenResults = await multicall.aggregate.staticCall([
      {
        target: token0Address[0],
        callData: tokenContractsInterface.encodeFunctionData('name'),
      },
      {
        target: token0Address[0],
        callData: tokenContractsInterface.encodeFunctionData('symbol'),
      },
      {
        target: token0Address[0],
        callData: tokenContractsInterface.encodeFunctionData('decimals'),
      },
      {
        target: token1Address[0],
        callData: tokenContractsInterface.encodeFunctionData('name'),
      },
      {
        target: token1Address[0],
        callData: tokenContractsInterface.encodeFunctionData('symbol'),
      },
      {
        target: token1Address[0],
        callData: tokenContractsInterface.encodeFunctionData('decimals'),
      },
    ]);

    const tokenresultsArray = tokenResults.returnData.map((data) =>
      typeof data === 'bigint' ? data.toString() : data
    );

    return {
      pairAddress,
      token0: {
        address: token0Address[0],
        name: tokenContractsInterface.decodeFunctionResult(
          'name',
          tokenresultsArray[0]
        ),
        symbol: tokenContractsInterface.decodeFunctionResult(
          'symbol',
          tokenresultsArray[1]
        ),
        decimals: tokenContractsInterface.decodeFunctionResult(
          'decimals',
          tokenresultsArray[2]
        ),
      },
      token1: {
        address: token1Address,
        name: tokenContractsInterface.decodeFunctionResult(
          'name',
          tokenresultsArray[3]
        ),
        symbol: tokenContractsInterface.decodeFunctionResult(
          'symbol',
          tokenresultsArray[4]
        ),
        decimals: tokenContractsInterface.decodeFunctionResult(
          'decimals',
          tokenresultsArray[5]
        ),
      },
      reserves: reservesData[0].toString(),
      totalSupply: totalSupplyValue[0].toString(),
    };
  } catch (error) {
    console.error('Error fetching pair details with Multicall:', error);
    return null;
  }
};
