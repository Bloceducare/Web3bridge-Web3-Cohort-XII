import { useState } from 'react';
import { fetchPairData, PairData } from '../lib/multicall';
import { ethers } from 'ethers';

export default function PairDataFetcher() {
  const [pairAddress, setPairAddress] = useState('');
  const [data, setData] = useState<PairData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchData = async () => {
    if (!ethers.isAddress(pairAddress)) {
      setError('Invalid Ethereum address');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await fetchPairData(pairAddress);
      setData(result);
    } catch (err: any) {
      console.error('Fetch error:', err.message); // Detailed error logging
      setError(`Failed to fetch pair data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Uniswap V2 Pair Data</h1>
      <div className="mb-4">
        <input
          type="text"
          value={pairAddress}
          onChange={(e) => setPairAddress(e.target.value)}
          placeholder="Enter Uniswap V2 Pair Address"
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleFetchData}
          disabled={loading}
          className="mt-2 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Fetching...' : 'Fetch Data'}
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {data && (
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold">Pair Details</h2>
          <p><strong>Total Supply:</strong> {data.totalSupply}</p>
          <h3 className="mt-2 font-semibold">Token 0</h3>
          <p><strong>Address:</strong> {data.token0.address}</p>
          <p><strong>Name:</strong> {data.token0.name}</p>
          <p><strong>Symbol:</strong> {data.token0.symbol}</p>
          <p><strong>Decimals:</strong> {data.token0.decimals}</p>
          <p><strong>Reserve:</strong> {data.reserves.reserve0}</p>
          <h3 className="mt-2 font-semibold">Token 1</h3>
          <p><strong>Address:</strong> {data.token1.address}</p>
          <p><strong>Name:</strong> {data.token1.name}</p>
          <p><strong>Symbol:</strong> {data.token1.symbol}</p>
          <p><strong>Decimals:</strong> {data.token1.decimals}</p>
          <p><strong>Reserve:</strong> {data.reserves.reserve1}</p>
        </div>
      )}
    </div>
  );
}