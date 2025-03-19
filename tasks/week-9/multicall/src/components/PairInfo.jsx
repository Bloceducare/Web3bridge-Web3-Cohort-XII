import { useState } from 'react';
import { ethers } from 'ethers';

const UNISWAP_V2_PAIR_ABI = [
  {
    inputs: [],
    name: 'token0',
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'token1',
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getReserves',
    outputs: [
      { type: 'uint112' },
      { type: 'uint112' },
      { type: 'uint32' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

const ERC20_ABI = [
  {
    inputs: [],
    name: 'name',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
];

const MULTICALL2_ADDRESS = '0x5BA1e12693Dc8F7d377E5E0141A2807ee3D99F33';
const MULTICALL2_ABI = [
  {
    inputs: [
      {
        components: [
          { name: 'target', type: 'address' },
          { name: 'callData', type: 'bytes' },
        ],
        name: 'calls',
        type: 'tuple[]',
      },
    ],
    name: 'tryAggregate',
    outputs: [
      {
        components: [
          { name: 'success', type: 'bool' },
          { name: 'returnData', type: 'bytes' },
        ],
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

export default function PairInfo() {
  const [pairAddress, setPairAddress] = useState('');
  const [pairInfo, setPairInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPairInfo = async () => {
    if (!pairAddress) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const provider = new ethers.JsonRpcProvider(`https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_MAINNET_API_KEY}`);



        
      const multicall2 = new ethers.Contract(MULTICALL2_ADDRESS, MULTICALL2_ABI, provider);
      const pairContract = new ethers.Contract(pairAddress, UNISWAP_V2_PAIR_ABI, provider);

      // Get token addresses
      const token0Address = await pairContract.token0();
      const token1Address = await pairContract.token1();

      // Get reserves and total supply
      const [reserves, totalSupply] = await Promise.all([
        pairContract.getReserves(),
        pairContract.totalSupply()
      ]);

      // Create token contracts
      const token0Contract = new ethers.Contract(token0Address, ERC20_ABI, provider);
      const token1Contract = new ethers.Contract(token1Address, ERC20_ABI, provider);

      // Get token details
      const [token0Name, token0Symbol, token0Decimals, token1Name, token1Symbol, token1Decimals] = 
        await Promise.all([
          token0Contract.name(),
          token0Contract.symbol(),
          token0Contract.decimals(),
          token1Contract.name(),
          token1Contract.symbol(),
          token1Contract.decimals()
        ]);

      setPairInfo({
        token0: {
          address: token0Address,
          name: token0Name,
          symbol: token0Symbol,
          decimals: token0Decimals,
        },
        token1: {
          address: token1Address,
          name: token1Name,
          symbol: token1Symbol,
          decimals: token1Decimals,
        },
        reserves: reserves,
        totalSupply: totalSupply,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Uniswap V2 Pair Explorer</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="pairAddress" className="block text-sm font-medium text-gray-700 mb-2">
              Enter Uniswap V2 Pair Address
            </label>
            <div className="flex gap-2">
              <input
                id="pairAddress"
                type="text"
                value={pairAddress}
                onChange={(e) => setPairAddress(e.target.value)}
                placeholder="0x..."
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button
                onClick={fetchPairInfo}
                disabled={loading || !pairAddress}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </span>
                ) : (
                  'Fetch Info'
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 font-medium">Error: {error}</p>
            </div>
          )}
        </div>
      </div>

      {pairInfo && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Token 0 Card */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Token 0</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Name</span>
                  <p className="font-medium">{pairInfo.token0.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Symbol</span>
                  <p className="font-medium">{pairInfo.token0.symbol}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Decimals</span>
                  <p className="font-medium">{pairInfo.token0.decimals}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Address</span>
                  <p className="font-mono text-sm break-all">{pairInfo.token0.address}</p>
                </div>
              </div>
            </div>

            {/* Token 1 Card */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Token 1</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Name</span>
                  <p className="font-medium">{pairInfo.token1.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Symbol</span>
                  <p className="font-medium">{pairInfo.token1.symbol}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Decimals</span>
                  <p className="font-medium">{pairInfo.token1.decimals}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Address</span>
                  <p className="font-mono text-sm break-all">{pairInfo.token1.address}</p>
                </div>
              </div>
            </div>

            {/* Reserves Card */}
            <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Reserves</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Token 0 Reserve</span>
                  <p className="font-medium text-lg">{ethers.formatUnits(pairInfo.reserves[0], pairInfo.token0.decimals)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Token 1 Reserve</span>
                  <p className="font-medium text-lg">{ethers.formatUnits(pairInfo.reserves[1], pairInfo.token1.decimals)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Last Updated</span>
                  <p className="font-medium">{new Date(Number(pairInfo.reserves[2]) * 1000).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Total Supply Card */}
            <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Total Supply</h3>
              <p className="font-medium text-2xl">{ethers.formatEther(pairInfo.totalSupply)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 