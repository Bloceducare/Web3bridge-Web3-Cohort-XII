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
      const provider = new ethers.providers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/import.meta.env.$`{VITE_ALCHEMY_MAINNET_API_KEY}`');
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
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-4">
        <input
          type="text"
          value={pairAddress}
          onChange={(e) => setPairAddress(e.target.value)}
          placeholder="Enter Uniswap V2 Pair Address"
          className="w-full p-2 border rounded"
        />
        <button
          onClick={fetchPairInfo}
          disabled={loading || !pairAddress}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          {loading ? 'Loading...' : 'Fetch Info'}
        </button>
      </div>

      {error && (
        <div className="text-red-500 mb-4">
          Error: {error}
        </div>
      )}

      {pairInfo && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Pair Information</h2>
          
          <div className="mb-4">
            <h3 className="font-semibold">Token 0</h3>
            <p>Name: {pairInfo.token0.name}</p>
            <p>Symbol: {pairInfo.token0.symbol}</p>
            <p>Decimals: {pairInfo.token0.decimals}</p>
            <p>Address: {pairInfo.token0.address}</p>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold">Token 1</h3>
            <p>Name: {pairInfo.token1.name}</p>
            <p>Symbol: {pairInfo.token1.symbol}</p>
            <p>Decimals: {pairInfo.token1.decimals}</p>
            <p>Address: {pairInfo.token1.address}</p>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold">Reserves</h3>
            <p>Token 0: {ethers.utils.formatUnits(pairInfo.reserves[0], pairInfo.token0.decimals)}</p>
            <p>Token 1: {ethers.utils.formatUnits(pairInfo.reserves[1], pairInfo.token1.decimals)}</p>
            <p>Timestamp: {new Date(pairInfo.reserves[2] * 1000).toLocaleString()}</p>
          </div>

          <div>
            <h3 className="font-semibold">Total Supply</h3>
            <p>{ethers.utils.formatEther(pairInfo.totalSupply)}</p>
          </div>
        </div>
      )}
    </div>
  );
} 