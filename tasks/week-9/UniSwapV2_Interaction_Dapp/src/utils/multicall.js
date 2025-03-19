import { ethers } from 'ethers';

const MULTICALL2_ABI = [
  'function aggregate(tuple(address target, bytes callData)[] calls) public view returns (uint256 blockNumber, bytes[] returnData)'
];

const MULTICALL2_ADDRESS = '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696';

export const multicall = {
  aggregate: {
    staticCall: async (provider, calls) => {
      const multicallContract = new ethers.Contract(
        MULTICALL2_ADDRESS,
        MULTICALL2_ABI,
        provider
      );

      try {
        return await multicallContract.aggregate.staticCall(calls);
      } catch (error) {
        console.error('Multicall error:', error);
        throw error;
      }
    }
  }
};