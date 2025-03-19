"use client"

import { useState, useEffect } from "react"
import { formatAddress } from "../../utils/format"

const SearchBar = ({
  pairAddress,
  setPairAddress,
  error,
  isLoading,
  getPairData,
  recentPairs,
  favorites,
  setFavorites,
}) => {
  const [showRecent, setShowRecent] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  const searchPairs = async () => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)

    try {
      // This is a simplified example - in a real app, you would call an API
      // that searches for pairs based on token symbols or names
      // For this demo, we'll just filter the recent pairs
      const results = recentPairs.filter((pair) => pair.name.toLowerCase().includes(searchQuery.toLowerCase()))

      // Add a small delay to simulate API call
      setTimeout(() => {
        setSearchResults(results)
        setIsSearching(false)
      }, 500)
    } catch (error) {
      console.error("Error searching pairs:", error)
      setIsSearching(false)
    }
  }

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery) {
        searchPairs()
      }
    }, 300)

    return () => clearTimeout(delaySearch)
  }, [searchQuery])

  return (
    <div className="bg-slate-800 bg-opacity-50 backdrop-blur-sm p-6 rounded-xl border border-slate-700 shadow-xl mb-8 transition-all duration-300 hover:shadow-purple-500/10">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-grow relative">
          <div className="flex">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="px-4 py-3 bg-slate-900 border-y border-l border-slate-700 rounded-l-lg hover:bg-slate-800 transition-all text-gray-400 hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            <input
              type="text"
              placeholder="Enter Uniswap V2 Pair Address"
              value={pairAddress}
              onChange={(e) => setPairAddress(e.target.value)}
              className="w-full p-3 bg-slate-900 bg-opacity-70 border border-slate-700 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all placeholder-gray-500"
              onFocus={() => setShowRecent(true)}
              onBlur={() => setTimeout(() => setShowRecent(false), 200)}
            />
          </div>
          {error && <p className="text-pink-400 text-sm mt-1">{error}</p>}

          {/* Recent pairs dropdown */}
          {showRecent && recentPairs.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
              <div className="p-2">
                <h3 className="text-xs text-gray-400 px-2 py-1">Recent Pairs</h3>
                {recentPairs.map((pair, index) => (
                  <div
                    key={pair.address}
                    className="px-2 py-2 hover:bg-slate-700 rounded cursor-pointer transition-colors"
                    onClick={() => {
                      setPairAddress(pair.address)
                      setShowRecent(false)
                      getPairData(pair.address)
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{pair.name}</span>
                      <span className="text-xs text-gray-400">{formatAddress(pair.address)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Favorites dropdown */}
          {showFavorites && favorites.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-slate-800 border border-pink-700 rounded-lg shadow-lg">
              <div className="p-2">
                <h3 className="text-xs text-pink-400 px-2 py-1 border-b border-pink-700/30">Favorite Pairs</h3>
                <div className="mt-1">
                  {favorites.map((pair, index) => (
                    <div
                      key={pair.address}
                      className="px-2 py-2 hover:bg-slate-700 rounded cursor-pointer transition-colors"
                      onClick={() => {
                        setPairAddress(pair.address)
                        setShowFavorites(false)
                        getPairData(pair.address)
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3 text-pink-400 mr-1"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                          {pair.name}
                        </span>
                        <span className="text-xs text-gray-400">{formatAddress(pair.address)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 transition-all text-pink-400 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span className="hidden sm:inline">Favorites</span>
          </button>
          <button
            onClick={() => getPairData()}
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-lg hover:from-pink-600 hover:to-indigo-600 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading...
              </div>
            ) : (
              "Analyze Pair"
            )}
          </button>
        </div>
      </div>

      {/* Search Panel */}
      {showSearch && (
        <div className="bg-slate-900 p-4 rounded-lg mt-4 border border-slate-700">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Search by token name or symbol"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            />
          </div>

          {isSearching ? (
            <div className="flex justify-center py-4">
              <svg
                className="animate-spin h-6 w-6 text-pink-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searchResults.map((pair) => (
                <div
                  key={pair.address}
                  className="p-2 hover:bg-slate-800 rounded cursor-pointer transition-colors"
                  onClick={() => {
                    setPairAddress(pair.address)
                    setShowSearch(false)
                    getPairData(pair.address)
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{pair.name}</span>
                    <span className="text-xs text-gray-400">{formatAddress(pair.address)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-4 text-gray-400">No results found for "{searchQuery}"</div>
          ) : (
            <div className="text-center py-4 text-gray-400">Enter a token name or symbol to search</div>
          )}
        </div>
      )}

      <div className="mt-3 text-xs text-gray-400">Example: 0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc (WETH/USDC)</div>
    </div>
  )
}

export default SearchBar

