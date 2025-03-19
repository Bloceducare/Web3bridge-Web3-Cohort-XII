// const provider = new ethers.providers.JsonRpcProvider(import.meta.env.ALCHEMY_SEPOLIA_API_KEY_URL);


import { useState } from 'react';
import { ethers } from 'ethers';
import multicallAbi from "./ABI/multicallabi.json";
import pairAbi from "./ABI/pairabi.json";
import erc20Abi from "./ABI/erc20.json";

  function App() {

    const multicallAddress = import.meta.env.multicallAddress;

    const provider = new ethers.JsonRpcProvider(import.meta.env.ALCHEMY_SEPOLIA_API_KEY_URL);

    const [pairAddress, setPairAddress] = useState('');
  const [pairData, setPairData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ethers.isAddress(pairAddress)) {
      setError('Invalid Ethereum address');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      // init
      const multicall = new ethers.Contract(multicallAddress, multicallAbi, provider);

      const pairInterface = new ethers.utils.Interface(pairAbi);
      const erc20Interface = new ethers.utils.Interface(erc20Abi);

      const pairCalls = [
        {
          target: pairAddress,
          callData: pairInterface.encodeFunctionData('token0'),
          value: 0
        },
        {
          target: pairAddress,
          callData: pairInterface.encodeFunctionData('token1'),
          value: 0
        },
        {
          target: pairAddress,
          callData: pairInterface.encodeFunctionData('getReserves'),
          value: 0
        },
        {
          target: pairAddress,
          callData: pairInterface.encodeFunctionData('totalSupply'),
          value: 0
        }
      ];

      // Exe aggra
      const [, pairResults] = await multicall.aggregate(pairCalls);

      // Results decoder pa
      const token0 = pairInterface.decodeFunctionResult('token0', pairResults[0])[0];
      const token1 = pairInterface.decodeFunctionResult('token1', pairResults[1])[0];
      const reserves = pairInterface.decodeFunctionResult('getReserves', pairResults[2]);
      const totalSupply = pairInterface.decodeFunctionResult('totalSupply', pairResults[3])[0];

      // Token details
      const tokenCalls = [
        { target: token0, callData: erc20Interface.encodeFunctionData('name'), value: 0 },
        { target: token0, callData: erc20Interface.encodeFunctionData('symbol'), value: 0 },
        { target: token0, callData: erc20Interface.encodeFunctionData('decimals'), value: 0 },
        { target: token1, callData: erc20Interface.encodeFunctionData('name'), value: 0 },
        { target: token1, callData: erc20Interface.encodeFunctionData('symbol'), value: 0 },
        { target: token1, callData: erc20Interface.encodeFunctionData('decimals'), value: 0 }
      ];

      const [, tokenResults] = await multicall.aggregate(tokenCalls);

      // Decode token results
      const token0Details = {
        name: erc20Interface.decodeFunctionResult('name', tokenResults[0])[0],
        symbol: erc20Interface.decodeFunctionResult('symbol', tokenResults[1])[0],
        decimals: erc20Interface.decodeFunctionResult('decimals', tokenResults[2])[0]
      };

      const token1Details = {
        name: erc20Interface.decodeFunctionResult('name', tokenResults[3])[0],
        symbol: erc20Interface.decodeFunctionResult('symbol', tokenResults[4])[0],
        decimals: erc20Interface.decodeFunctionResult('decimals', tokenResults[5])[0]
      };

      setPairData({
        token0: { address: token0, ...token0Details },
        token1: { address: token1, ...token1Details },
        reserves: {
          reserve0: reserves._reserve0.toString(),
          reserve1: reserves._reserve1.toString(),
          blockTimestamp: reserves._blockTimestampLast.toString()
        },
        totalSupply: totalSupply.toString()
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Uniswap V2 Pair Explorer</h1>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={pairAddress}
              onChange={(e) => setPairAddress(e.target.value.trim())}
              placeholder="Enter Pair Address (0x...)"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Loading...' : 'Analyze'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">Error: {error}</p>
          </div>
        )}

        {pairData && (
          <div className="space-y-6">
            {/* Token Details Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-4">Token Details</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <TokenDetailsCard title="Token 0" data={pairData.token0} />
                <TokenDetailsCard title="Token 1" data={pairData.token1} />
              </div>
            </div>

            {/* Reserves Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-4">Pool Reserves</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <StatCard label="Reserve 0" value={pairData.reserves.reserve0} />
                <StatCard label="Reserve 1" value={pairData.reserves.reserve1} />
                <StatCard 
                  label="Last Updated Block" 
                  value={pairData.reserves.blockTimestamp} 
                />
              </div>
            </div>

            {/* Total Supply Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-4">LP Token Supply</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-3xl font-mono text-gray-800">
                  {formatLargeNumber(pairData.totalSupply)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const DetailItem = ({ label, value }) => (
  <div className="flex justify-between items-center py-1">
    <dt className="text-gray-600">{label}:</dt>
    <dd className="font-mono text-gray-800">{value}</dd>
  </div>
);

const StatCard = ({ label, value }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <h3 className="text-sm font-medium text-gray-500 mb-1">{label}</h3>
    <p className="text-lg font-mono text-gray-800">{value}</p>
  </div>
);

// Utility function
function formatLargeNumber(num) {
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2
  }).format(num);
}

export default App;
