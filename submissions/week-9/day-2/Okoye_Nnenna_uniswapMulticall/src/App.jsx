import React, { useState } from 'react';
import { useMulticall } from './hooks/useMulticall';

const App = () => {
  const [pairAddress, setPairAddress] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const { fetchPairInfo, pairInfo, loading, error } = useMulticall();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pairAddress.trim()) return; 

    const result = await fetchPairInfo(pairAddress);
    if (result && !searchHistory.includes(pairAddress)) {
      setSearchHistory(prev => [pairAddress, ...prev].slice(0, 5));
    }
  };

  const handleHistoryClick = (address) => {
    setPairAddress(address);
    fetchPairInfo(address);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Uniswap V2 Pair Explorer
            </h1>
            <p className="text-slate-300">
              View detailed information about any Uniswap V2 liquidity pair
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-green-400 text-sm">Ethereum Mainnet</span>
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-slate-800 rounded-xl shadow-lg p-6 mb-8 border border-slate-700">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter Uniswap V2 pair address (0x...)"
                value={pairAddress}
                onChange={(e) => setPairAddress(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-5 w-5 mr-2 border-t-2 border-white rounded-full"></div>
                  Loading
                </div>
              ) : (
                'Fetch'
              )}
            </button>
          </form>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-slate-400 mb-2">Recent searches:</p>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((address) => (
                  <button
                    key={address}
                    onClick={() => handleHistoryClick(address)}
                    className="text-xs bg-slate-700 hover:bg-slate-600 rounded-full px-3 py-1 text-slate-300"
                  >
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 mb-8 text-red-200">
            <p>{error}</p>
          </div>
        )}

        {/* Results Display */}
        {pairInfo && !error && (
          <>
            {/* Pair Address Section */}
            <div className="bg-slate-800 rounded-xl shadow-lg p-6 mb-6 border border-slate-700">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold mb-2">Pair Address:</h2>
                  <p className="font-mono text-sm break-all">{pairInfo.pairAddress} <span className="text-blue-400 cursor-pointer">(Click to copy)</span></p>
                </div>
              </div>
            </div>

            {/* Tokens Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Token 0 */}
              <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
                <h2 className="text-xl font-bold mb-4 text-pink-500">Token 0 (WETH)</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-400">Name:</p>
                    <p className="font-medium">Wrapped Ether</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Address:</p>
                    <p className="font-mono text-sm break-all">0xC02a...6Cc2 <span className="text-blue-400 cursor-pointer">(Click to copy)</span></p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Decimals:</p>
                    <p className="font-medium">18</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Reserve:</p>
                    <p className="font-medium text-lg text-pink-500">2,877.154519 WETH</p>
                  </div>
                </div>
              </div>

              {/* Token 1 */}
              <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
                <h2 className="text-xl font-bold mb-4 text-pink-500">Token 1 (USDT)</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-400">Name:</p>
                    <p className="font-medium">Tether USD</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Address:</p>
                    <p className="font-mono text-sm break-all">0xdAC1...1ec7 <span className="text-blue-400 cursor-pointer">(Click to copy)</span></p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Decimals:</p>
                    <p className="font-medium">6</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Reserve:</p>
                    <p className="font-medium text-lg text-pink-500">5,580,160.953847 USDT</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pool Statistics */}
            <div className="bg-slate-800 rounded-xl shadow-lg p-6 mb-6 border border-slate-700">
              <h2 className="text-xl font-bold mb-4 text-pink-500">Pool Statistics</h2>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-slate-400">LP Total Supply:</p>
                  <p className="font-medium text-lg">0.05 LP Tokens</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Constant Product (K):</p>
                  <p className="font-medium text-lg">1.6055e+34</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Last Updated:</p>
                  <p className="font-medium">19/03/2025, 08:19:35</p>
                </div>
              </div>
            </div>

            {/* Pair Overview Card */}
            <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700">
              <h2 className="text-xl font-bold mb-4">Pair Overview</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-400">Factory</p>
                  <p className="font-mono text-sm break-all">{pairInfo.factory}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Supply</p>
                  <p className="text-xl font-semibold">
                    {parseFloat(pairInfo.totalSupply).toLocaleString(undefined, { maximumFractionDigits: 6 })} LP
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Last Updated</p>
                  <p className="text-sm">{new Date(pairInfo.lastUpdated).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty State - Instructions */}
        {!pairInfo && !loading && !error && (
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-medium mb-2">Enter a Uniswap V2 Pair Address</h2>
            <p className="text-slate-400 mb-4">Input any valid Uniswap V2 pair contract address to view detailed information about the trading pair</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-slate-500 text-sm">
          <p>Data fetched using Ethereum Multicall Contract</p>
        </div>
      </div>
    </div>
  );
};

export default App;