import { useState } from 'react';

const App = () => {
  const [pairAddress, setPairAddress] = useState('');
  const [pairData, setPairData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mock data for demonstration purposes
  const mockPairData = {
    token0: {
      symbol: "WETH",
      name: "Wrapped Ether",
      decimals: 18,
      totalSupply: "2000000000000000000000",
      balance: "450000000000000000000"
    },
    token1: {
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      totalSupply: "50000000000000",
      balance: "25000000000000"
    },
    reserves: {
      reserve0: "800000000000000000000",
      reserve1: "1500000000000000",
      blockTimestampLast: 1678234567
    },
    totalSupply: "1100000000000000000000",
    pairAddress: "0x0000000000000000000000000000000000000000"
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPairData(null);

    // Simulate API call
    setTimeout(() => {
      try {
        if (pairAddress.length < 10) {
          throw new Error("Invalid address");
        }
        setPairData({...mockPairData, pairAddress: pairAddress});
      } catch (err) {
        console.error('Error fetching pair data:', err);
        setError('Failed to fetch pair data. Please check the address and try again.');
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-900 text-white">
      {/* Crypto-style background elements */}
      <div className="fixed inset-0 z-0 overflow-hidden opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGgyLjI4djJIMzh2LTJoLTJ2NmgxMHYtNmgtMS43MnYySDQydi0yaC0ydjZoLTR2LTZ6TTIyIDMwaDJ2MmgtMnpNMjYgMzJoMnYtMmgtNHY2aDR2LTJoLTJ2LTJ6IiBmaWxsPSIjZmZmIi8+PC9nPjwvc3ZnPg==')]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header with crypto aesthetic */}
        <div className="flex justify-center mb-12">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-lg blur opacity-75"></div>
            <div className="relative px-8 py-4 bg-black rounded-lg">
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
                UNISWAP V2 EXPLORER
              </h1>
            </div>
          </div>
        </div>

        {/* Search Panel */}
        <div className="max-w-3xl mx-auto">
          <div className="backdrop-blur-md bg-black/40 border border-purple-500/30 rounded-xl p-6 mb-8 shadow-lg shadow-purple-500/20">
            <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={pairAddress}
                onChange={(e) => setPairAddress(e.target.value)}
                placeholder="Enter Uniswap V2 Pair Address"
                className="flex-1 px-4 py-3 bg-gray-900 border border-purple-500/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-gray-100 placeholder-gray-400"
                required
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold px-6 py-3 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Fetch Data'}
              </button>
            </form>
          
            {error && (
              <div className="mt-4 p-4 bg-red-900/40 border border-red-500 text-red-200 rounded-lg">
                {error}
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block h-16 w-16 relative">
                <div className="absolute inset-0 rounded-full border-4 border-purple-500/30"></div>
                <div className="absolute inset-0 rounded-full border-t-4 border-cyan-400 animate-spin"></div>
              </div>
              <p className="mt-4 text-lg text-cyan-300">Fetching on-chain data...</p>
            </div>
          )}

          {/* Results Panel */}
          {pairData && (
            <div className="backdrop-blur-md bg-black/40 border border-purple-500/30 rounded-xl p-6 shadow-lg shadow-purple-500/20">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 p-4 rounded-lg">
                  <h2 className="text-xl font-bold text-cyan-300 mb-2">Pair Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/30 p-3 rounded-lg border border-purple-500/30">
                      <p className="text-gray-400">Pair Address</p>
                      <p className="text-sm text-white break-all">{pairData.pairAddress}</p>
                    </div>
                    <div className="bg-black/30 p-3 rounded-lg border border-purple-500/30">
                      <p className="text-gray-400">Total Supply</p>
                      <p className="text-white">{Number(pairData.totalSupply) / 10**18} LP Tokens</p>
                    </div>
                  </div>
                </div>
                  
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Token 0 */}
                  <div className="bg-gradient-to-r from-purple-900/50 to-black/50 p-4 rounded-lg">
                    <h3 className="font-bold text-purple-300 mb-2">Token 0</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Symbol</span>
                        <span className="text-white">{pairData.token0.symbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Name</span>
                        <span className="text-white">{pairData.token0.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Decimals</span>
                        <span className="text-white">{pairData.token0.decimals}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Reserve</span>
                        <span className="text-white">{Number(pairData.reserves.reserve0) / 10**pairData.token0.decimals}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Token 1 */}
                  <div className="bg-gradient-to-r from-cyan-900/50 to-black/50 p-4 rounded-lg">
                    <h3 className="font-bold text-cyan-300 mb-2">Token 1</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Symbol</span>
                        <span className="text-white">{pairData.token1.symbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Name</span>
                        <span className="text-white">{pairData.token1.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Decimals</span>
                        <span className="text-white">{pairData.token1.decimals}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Reserve</span>
                        <span className="text-white">{Number(pairData.reserves.reserve1) / 10**pairData.token1.decimals}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;