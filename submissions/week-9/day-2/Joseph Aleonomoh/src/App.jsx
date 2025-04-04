import { useState, useEffect } from 'react';
import { formatEther, formatUnits } from 'ethers';
import useUniswapV2 from './hooks/useUniswapV2';

function App() {
  const [inputData, setInputData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchCount, setSearchCount] = useState(0);
  const [achievements, setAchievements] = useState([]);
  
  const { tokenAddresses, reserves, totalSupply, tokenPairData, fetchUniswapData } = useUniswapV2();
  
  const handleFetchData = async (e) => {
    e.preventDefault();
    if (!inputData.trim()) {
      setError("Please enter a valid Uniswap V2 pair address");
      return;
    }
    
    setError("");
    setSearchCount(prev => prev + 1);
    setIsLoading(true);
    
    try {
      await fetchUniswapData(inputData);
    } catch (err) {
      setError(`Failed to fetch data: ${err.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check for achievements
  useEffect(() => {
    if (searchCount === 1) {
      setAchievements(prev => [...prev, { 
        id: 'first-search', 
        title: 'First Explorer', 
        description: 'You made your first search!',
        icon: '🔍'
      }]);
    }
    if (searchCount === 5) {
      setAchievements(prev => [...prev, { 
        id: 'frequent-user', 
        title: 'Liquidity Detective', 
        description: 'You\'ve made 5 searches!',
        icon: '🕵️'
      }]);
    }
    if (tokenAddresses && tokenAddresses.length > 0 && !achievements.find(a => a.id === 'data-finder')) {
      setAchievements(prev => [...prev, { 
        id: 'data-finder', 
        title: 'Data Wizard', 
        description: 'Successfully retrieved pair data!',
        icon: '✨'
      }]);
    }
  }, [searchCount]);
  
  // Check if we have data to display
  const hasData = tokenAddresses && tokenAddresses.length > 0;
  
  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-8 overflow-hidden">
      {/* Blockchain Network Visualization */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[url('/blockchain-pattern.svg')] bg-[length:40px_40px] animate-network"></div>
      </div>

      {/* Top Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-1/2 h-64 bg-indigo-600 opacity-20 blur-3xl"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 animate-gradient">
            Uniswap V2 Explorer
          </h1>
          <p className="text-lg text-indigo-300">Dive into the world of liquidity pools</p>
          
          {/* Achievement badges */}
          {achievements.length > 0 && (
            <div className="mt-6 flex justify-center flex-wrap gap-2">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id} 
                  className="px-3 py-1 bg-indigo-900/50 border border-indigo-500/30 rounded-full 
                             transition-all hover:bg-indigo-800/50 group relative hover:scale-105"
                >
                  <span className="text-sm font-medium flex items-center gap-1">
                    <span>{achievement.icon}</span>
                    <span>{achievement.title}</span>
                  </span>
                  
                  {/* Tooltip */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-800 px-3 py-1 
                                 rounded-md text-xs opacity-0 invisible group-hover:opacity-100 
                                 group-hover:visible transition-opacity z-20 whitespace-nowrap">
                    {achievement.description}
                  </div>
                </div>
              ))}
            </div>
          )}
        </header>
        
        {/* Search Form */}
        <div className="relative mb-10">
          {/* Border glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg opacity-75 blur animate-pulse"></div>
          
          <div className="relative bg-gray-800 border border-gray-700 rounded-lg p-6">
            <form onSubmit={handleFetchData} className="flex flex-col md:flex-row gap-4">
              <input 
                type="text" 
                placeholder="Enter Uniswap V2 Pair Address" 
                value={inputData}
                onChange={e => setInputData(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 
                           focus:border-indigo-500 focus:outline-none text-white placeholder-gray-400"
              />
              <button 
                type="submit" 
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 
                           hover:to-indigo-700 rounded-lg font-medium transition-colors 
                           disabled:opacity-50 flex items-center justify-center hover:scale-105"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading
                  </span>
                ) : 'Explore Pair'}
              </button>
            </form>
            {error && <p className="mt-3 text-red-400">{error}</p>}
            
            {/* Level indicator */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="flex justify-between text-sm mb-1">
                <span>Explorer Level: {Math.min(Math.floor(searchCount / 2) + 1, 10)}</span>
                <span>{searchCount} / {Math.min(Math.floor(searchCount / 2) + 1, 10) * 2} searches</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" 
                  style={{ width: `${(searchCount % 2) / 2 * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Results Section */}
        {isLoading ? (
          <div className="text-center py-16">
            {/* Custom blockchain loading animation */}
            <div className="inline-flex items-center justify-center">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-indigo-300/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-indigo-500 border-l-transparent border-r-transparent border-b-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-3 border-4 border-r-blue-500 border-l-transparent border-t-transparent border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                <div className="absolute inset-6 bg-blue-500/20 rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="mt-6 text-indigo-300">Connecting to the blockchain...</p>
          </div>
        ) : hasData ? (
          <div className="space-y-8">
            {/* Summary Card */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
              <h2 className="text-xl font-semibold mb-6 text-indigo-300 flex items-center">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                Pair Summary
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-850 transition-colors">
                  <p className="text-gray-400 text-sm mb-2">Total LP Supply</p>
                  <p className="text-2xl font-bold text-indigo-400">
                    {parseFloat(formatEther(totalSupply)).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  </p>
                </div>
                
                <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-850 transition-colors">
                  <p className="text-gray-400 text-sm mb-2">Token 0</p>
                  <p className="text-xl font-bold text-blue-400">
                    {tokenPairData[0]?.symbol || "..."}
                  </p>
                  <div className="mt-1 text-sm text-gray-500 truncate">
                    {tokenAddresses[0]?.substring(0, 6)}...{tokenAddresses[0]?.substring(38)}
                  </div>
                </div>
                
                <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-850 transition-colors">
                  <p className="text-gray-400 text-sm mb-2">Token 1</p>
                  <p className="text-xl font-bold text-purple-400">
                    {tokenPairData[1]?.symbol || "..."}
                  </p>
                  <div className="mt-1 text-sm text-gray-500 truncate">
                    {tokenAddresses[1]?.substring(0, 6)}...{tokenAddresses[1]?.substring(38)}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Token Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tokenAddresses.map((address, index) => (
                <div 
                  key={address} 
                  className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow"
                >
                  {/* Highlight glow on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${
                    index === 0 ? 'from-blue-600/5 to-blue-800/5' : 'from-purple-600/5 to-purple-800/5'
                  } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  
                  <div className="flex items-center justify-between mb-6 relative">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        index === 0 ? 'bg-blue-500' : 'bg-purple-500'
                      }`}></span>
                      {tokenPairData[index]?.symbol || `Token ${index}`}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      index === 0 ? 'bg-blue-900/50 text-blue-300 border border-blue-500/30' : 'bg-purple-900/50 text-purple-300 border border-purple-500/30'
                    }`}>
                      Token {index}
                    </span>
                  </div>
                  
                  <div className="space-y-4 relative">
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:bg-gray-850 transition-colors">
                      <p className="text-gray-400 text-sm mb-1">Reserve</p>
                      <p className="text-xl font-semibold">
                        {parseFloat(formatUnits(reserves[index], Number(tokenPairData[index].decimals))).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:bg-gray-850 transition-colors">
                        <p className="text-gray-400 text-sm mb-1">Decimals</p>
                        <p className="text-lg font-semibold">{tokenPairData[index]?.decimals || "..."}</p>
                      </div>
                      
                      {/* <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:bg-gray-850 transition-colors">
                        <p className="text-gray-400 text-sm mb-1">Share</p>
                        <p className="text-lg font-semibold">
                          {reserves[0] && reserves[1] ? 
                            ((parseFloat(formatUnits(reserves[index], Number(tokenPairData[index].decimals))) / (parseFloat(formatUnits(reserves[0], Number(tokenPairData[index].decimals))) + parseFloat(formatUnits(reserves[1], Number(tokenPairData[index].decimals))))) * 100).toFixed(2) + "%" : 
                            "..."}
                        </p>
                      </div> */}
                    </div>
                    
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:bg-gray-850 transition-colors">
                      <p className="text-gray-400 text-sm mb-1">Address</p>
                      <div className="flex items-center">
                        <p className="text-xs break-all overflow-x-auto font-mono">
                          {address}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center shadow-lg relative overflow-hidden hover:shadow-xl transition-shadow">
            {/* Background effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20"></div>
            
            <div className="relative">
              {/* Ethereum logo */}
              <div className="w-20 h-20 mx-auto mb-6 opacity-70">
                <svg viewBox="0 0 256 417" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" className="w-full h-full">
                  <path fill="#343434" d="M127.961 0l-2.795 9.5v275.668l2.795 2.79 127.962-75.638z"/>
                  <path fill="#8C8C8C" d="M127.962 0L0 212.32l127.962 75.639V154.158z"/>
                  <path fill="#3C3C3B" d="M127.961 312.187l-1.575 1.92v98.199l1.575 4.6L256 236.587z"/>
                  <path fill="#8C8C8C" d="M127.962 416.905v-104.72L0 236.585z"/>
                  <path fill="#141414" d="M127.961 287.958l127.96-75.637-127.96-58.162z"/>
                  <path fill="#393939" d="M0 212.32l127.96 75.638v-133.8z"/>
                </svg>
              </div>
              
              <h2 className="text-xl font-semibold mb-3">Ready to Explore Pairs</h2>
              <p className="text-gray-400 max-w-lg mx-auto">
                Enter a Uniswap V2 pair address above to reveal detailed information about the liquidity pool.
              </p>
              
              {/* Example address suggestion */}
              <div className="mt-8 inline-block p-4 bg-indigo-900/30 border border-indigo-500/30 rounded-lg text-left hover:bg-indigo-900/40 transition-colors">
                <h3 className="font-medium flex items-center gap-2 mb-2">
                  <span>💡</span>
                  <span>Try an Example</span>
                </h3>
                <p className="text-sm text-gray-300">
                  WETH/USDC: <span className="font-mono text-xs text-indigo-300">0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc</span>
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Uniswap V2 Explorer • Built for Web3</p>
        </footer>
      </div>
      
      {/* New achievement notification */}
      {achievements.length > 0 && achievements.slice(-1)[0] && (
        <div className="fixed bottom-4 right-4 p-4 bg-gray-800 border border-indigo-500/30 rounded-lg shadow-lg max-w-xs animate-bounce hover:shadow-xl transition-shadow">
          <div className="flex items-start gap-3">
            <div className="text-2xl">{achievements.slice(-1)[0].icon}</div>
            <div>
              <h3 className="font-medium text-indigo-400">{achievements.slice(-1)[0].title} Unlocked!</h3>
              <p className="text-sm text-gray-300">{achievements.slice(-1)[0].description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;