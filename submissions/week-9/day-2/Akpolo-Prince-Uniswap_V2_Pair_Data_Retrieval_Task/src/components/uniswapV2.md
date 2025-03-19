"use client"

import { useState, useEffect, useRef } from "react"
import { ethers } from "ethers"
import { getReadOnlyProvider } from "../utils/provider"

const UniswapV2 = () => {
  const multiCallContractAddress = "0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696"
  const [token0, setToken0] = useState("")
  const [token1, setToken1] = useState("")
  const [reserve0, setReserve0] = useState("")
  const [reserve1, setReserve1] = useState("")
  const [totalSupply, setTotalSupply] = useState("")
  const [pairAddress, setPairAddress] = useState("")
  const [token0Details, setToken0Details] = useState({ name: "", symbol: "", decimals: "" })
  const [token1Details, setToken1Details] = useState({ name: "", symbol: "", decimals: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState("")
  const [recentPairs, setRecentPairs] = useState([])
  const [showRecent, setShowRecent] = useState(false)
  const [favorites, setFavorites] = useState([])
  const [lpAmount, setLpAmount] = useState("")
  const [showFavorites, setShowFavorites] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [swapAmount, setSwapAmount] = useState("1")
  const [swapDirection, setSwapDirection] = useState("0to1")
  const [expectedOutput, setExpectedOutput] = useState("")
  const [priceImpact, setPriceImpact] = useState("")
  const [shareLink, setShareLink] = useState("")
  const [showShareTooltip, setShowShareTooltip] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  // Load recent pairs from localStorage on component mount
  useEffect(() => {
    const savedPairs = localStorage.getItem("recentPairs")
    if (savedPairs) {
      setRecentPairs(JSON.parse(savedPairs))
    }
  }, [])

  // Load favorites
  useEffect(() => {
    const savedFavorites = localStorage.getItem("favoritePairs")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  // Check URL for pair address
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const pairParam = urlParams.get("pair")
    if (pairParam && ethers.isAddress(pairParam)) {
      setPairAddress(pairParam)
      getPairData(pairParam)
    }
  }, [])

  // Generate share link when pair data is loaded
  useEffect(() => {
    if (pairAddress && token0Details.symbol && token1Details.symbol) {
      const url = new URL(window.location.href)
      url.searchParams.set("pair", pairAddress)
      setShareLink(url.toString())
    }
  }, [pairAddress, token0Details, token1Details])

  // Calculate swap output when inputs change
  useEffect(() => {
    if (reserve0 && reserve1 && token0Details.decimals && token1Details.decimals) {
      calculateSwapOutput()
    }
  }, [swapAmount, swapDirection, reserve0, reserve1, token0Details.decimals, token1Details.decimals])

  // Draw chart when data is available and tab is active
  useEffect(() => {
    if (reserve0 && reserve1 && token0Details.decimals && token1Details.decimals && activeTab === "reserves") {
      // Use a small delay to ensure the canvas is rendered
      const timer = setTimeout(() => {
        if (chartRef.current) {
          drawEnhancedChart()
        }
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [reserve0, reserve1, token0Details, token1Details, activeTab])

  const drawEnhancedChart = () => {
    const canvas = chartRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Calculate values and percentages
    const reserve0Value = Number.parseFloat(ethers.formatUnits(reserve0, token0Details.decimals))
    const reserve1Value = Number.parseFloat(ethers.formatUnits(reserve1, token1Details.decimals))
    const total = reserve0Value + reserve1Value

    const reserve0Percent = (reserve0Value / total) * 100
    const reserve1Percent = (reserve1Value / total) * 100

    // Colors
    const token0Color = "#ec4899" // Pink
    const token1Color = "#818cf8" // Indigo
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 20

    // Draw token0 slice (full circle)
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.fillStyle = token0Color
    ctx.fill()

    // Draw token1 slice on top (partial circle based on percentage)
    const token1StartAngle = 0
    const token1EndAngle = (Math.PI * 2 * reserve1Percent) / 100

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.arc(centerX, centerY, radius, token1StartAngle, token1EndAngle)
    ctx.fillStyle = token1Color
    ctx.fill()

    // Add center circle for donut effect
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2)
    ctx.fillStyle = "#0f172a"
    ctx.fill()

    // Add text in center
    ctx.fillStyle = "#ffffff"
    ctx.font = "14px Arial"
    ctx.textAlign = "center"
    ctx.fillText("Reserves", centerX, centerY - 10)
    ctx.font = "12px Arial"
    ctx.fillText(`Total: ${(reserve0Value + reserve1Value).toLocaleString()}`, centerX, centerY + 10)

    // Add labels with percentages
    // Token0 label
    const token0LabelX = centerX - radius - 10
    const token0LabelY = centerY
    ctx.fillStyle = token0Color
    ctx.beginPath()
    ctx.arc(token0LabelX - 15, token0LabelY, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = "#ffffff"
    ctx.textAlign = "right"
    ctx.fillText(`${token0Details.symbol}: ${reserve0Percent.toFixed(1)}%`, token0LabelX - 25, token0LabelY + 4)

    // Token1 label
    const token1LabelX = centerX + radius + 10
    const token1LabelY = centerY
    ctx.fillStyle = token1Color
    ctx.beginPath()
    ctx.arc(token1LabelX + 15, token1LabelY, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = "#ffffff"
    ctx.textAlign = "left"
    ctx.fillText(`${token1Details.symbol}: ${reserve1Percent.toFixed(1)}%`, token1LabelX + 25, token1LabelY + 4)
  }

  const calculateSwapOutput = () => {
    try {
      if (!swapAmount || isNaN(Number.parseFloat(swapAmount)) || Number.parseFloat(swapAmount) <= 0) {
        setExpectedOutput("")
        setPriceImpact("")
        return
      }

      const reserve0BN = ethers.getBigInt(reserve0)
      const reserve1BN = ethers.getBigInt(reserve1)

      let inputAmount
      let inputReserve
      let outputReserve
      let inputDecimals
      let outputDecimals

      if (swapDirection === "0to1") {
        inputAmount = ethers.parseUnits(swapAmount, token0Details.decimals)
        inputReserve = reserve0BN
        outputReserve = reserve1BN
        inputDecimals = token0Details.decimals
        outputDecimals = token1Details.decimals
      } else {
        inputAmount = ethers.parseUnits(swapAmount, token1Details.decimals)
        inputReserve = reserve1BN
        outputReserve = reserve0BN
        inputDecimals = token1Details.decimals
        outputDecimals = token0Details.decimals
      }

      // Calculate output amount using Uniswap formula
      // outputAmount = (inputAmount * 997 * outputReserve) / (inputReserve * 1000 + inputAmount * 997)
      const inputAmountWithFee = inputAmount * 997n
      const numerator = inputAmountWithFee * outputReserve
      const denominator = inputReserve * 1000n + inputAmountWithFee
      const outputAmount = numerator / denominator

      // Calculate price impact
      const spotPrice = (outputReserve * 1000n) / (inputReserve * 997n)
      const executionPrice = (outputAmount * 1000n) / (inputAmount * 997n)
      const impact = (1 - Number((executionPrice * 10000n) / spotPrice) / 10000) * 100

      setExpectedOutput(ethers.formatUnits(outputAmount, outputDecimals))
      setPriceImpact(impact.toFixed(2))
    } catch (error) {
      console.error("Error calculating swap output:", error)
      setExpectedOutput("Error")
      setPriceImpact("")
    }
  }

  const getPairData = async (address = pairAddress) => {
    if (!address) {
      setError("Please enter a pair address")
      return
    }

    if (!ethers.isAddress(address)) {
      setError("Invalid Ethereum address")
      return
    }

    setError("")
    setIsLoading(true)

    try {
      const provider = getReadOnlyProvider()

      const multiCallContractABI = (await import("../ABI/multicall.json")).default
      const uniswapV2PairABI = (await import("../ABI/uniswap.json")).default

      const multiCallContract = new ethers.Contract(multiCallContractAddress, multiCallContractABI, provider)
      const pairContract = new ethers.Contract(address, uniswapV2PairABI, provider)

      const calls = [
        {
          target: address,
          callData: pairContract.interface.encodeFunctionData("token0", []),
        },
        {
          target: address,
          callData: pairContract.interface.encodeFunctionData("token1", []),
        },
        {
          target: address,
          callData: pairContract.interface.encodeFunctionData("getReserves", []),
        },
        {
          target: address,
          callData: pairContract.interface.encodeFunctionData("totalSupply", []),
        },
      ]

      const [blockNumber, returnData] = await multiCallContract.aggregate.staticCall(calls)

      const token0Address = pairContract.interface.decodeFunctionResult("token0", returnData[0])[0]
      const token1Address = pairContract.interface.decodeFunctionResult("token1", returnData[1])[0]

      const reserves = pairContract.interface.decodeFunctionResult("getReserves", returnData[2])
      const totalSupply = pairContract.interface.decodeFunctionResult("totalSupply", returnData[3])[0]

      setToken0(token0Address)
      setToken1(token1Address)
      setReserve0(reserves[0].toString())
      setReserve1(reserves[1].toString())
      setTotalSupply(totalSupply.toString())

      const token0Details = await tokenDetails(token0Address)
      const token1Details = await tokenDetails(token1Address)

      setToken0Details(token0Details)
      setToken1Details(token1Details)

      // Save to recent pairs
      saveToRecentPairs(address, token0Details.symbol, token1Details.symbol)
    } catch (error) {
      console.error("Error fetching pair data:", error)
      setError("Failed to fetch pair data. Please check the address and try again.")
    } finally {
      setIsLoading(false)
    }
  }

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

  const saveToRecentPairs = (address, symbol0, symbol1) => {
    const pairInfo = {
      address,
      name: `${symbol0}/${symbol1}`,
      timestamp: Date.now(),
    }

    // Add to recent pairs, remove duplicates, and keep only the last 5
    const updatedPairs = [pairInfo, ...recentPairs.filter((pair) => pair.address !== address)].slice(0, 5)

    setRecentPairs(updatedPairs)
    localStorage.setItem("recentPairs", JSON.stringify(updatedPairs))
  }

  const tokenDetails = async (tokenAddress) => {
    try {
      const provider = getReadOnlyProvider()

      const multiCallContractABI = (await import("../ABI/multicall.json")).default
      const tokenABI = (await import("../ABI/erc20.json")).default

      const multiCallContract = new ethers.Contract(multiCallContractAddress, multiCallContractABI, provider)
      const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider)

      const calls = [
        {
          target: tokenAddress,
          callData: tokenContract.interface.encodeFunctionData("name", []),
        },
        {
          target: tokenAddress,
          callData: tokenContract.interface.encodeFunctionData("symbol", []),
        },
        {
          target: tokenAddress,
          callData: tokenContract.interface.encodeFunctionData("decimals", []),
        },
      ]

      const [blockNumber, returnData] = await multiCallContract.aggregate.staticCall(calls)

      const name = tokenContract.interface.decodeFunctionResult("name", returnData[0])[0]
      const symbol = tokenContract.interface.decodeFunctionResult("symbol", returnData[1])[0]
      const decimals = tokenContract.interface.decodeFunctionResult("decimals", returnData[2])[0]

      return { name, symbol, decimals }
    } catch (error) {
      console.error("Error fetching token details:", error)
      return { name: "N/A", symbol: "N/A", decimals: "18" }
    }
  }

  const formatAddress = (address) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(""), 2000)
  }

  const shareToClipboard = () => {
    navigator.clipboard.writeText(shareLink)
    setShowShareTooltip(true)
    setTimeout(() => setShowShareTooltip(false), 2000)
  }

  const formatNumber = (value, decimals = 18) => {
    if (!value) return "0"
    try {
      const formatted = ethers.formatUnits(value, decimals)
      return Number.parseFloat(formatted).toLocaleString(undefined, {
        maximumFractionDigits: 6,
      })
    } catch (error) {
      return value
    }
  }

  const calculatePrice = () => {
    if (!reserve0 || !reserve1 || !token0Details.decimals || !token1Details.decimals) {
      return { token0Price: "0", token1Price: "0" }
    }

    try {
      const reserve0Formatted = ethers.formatUnits(reserve0, token0Details.decimals)
      const reserve1Formatted = ethers.formatUnits(reserve1, token1Details.decimals)

      const token0Price = Number.parseFloat(reserve1Formatted) / Number.parseFloat(reserve0Formatted)
      const token1Price = Number.parseFloat(reserve0Formatted) / Number.parseFloat(reserve1Formatted)

      return {
        token0Price: token0Price.toLocaleString(undefined, { maximumFractionDigits: 8 }),
        token1Price: token1Price.toLocaleString(undefined, { maximumFractionDigits: 8 }),
      }
    } catch (error) {
      return { token0Price: "0", token1Price: "0" }
    }
  }

  const calculateLiquidityShare = (lpAmount) => {
    if (!totalSupply || !reserve0 || !reserve1 || !token0Details.decimals || !token1Details.decimals) {
      return { share0: "0", share1: "0", percentage: "0" }
    }

    try {
      const totalSupplyFormatted = ethers.formatEther(totalSupply)
      const percentage = (Number.parseFloat(lpAmount) / Number.parseFloat(totalSupplyFormatted)) * 100

      if (isNaN(percentage) || percentage <= 0) {
        return { share0: "0", share1: "0", percentage: "0" }
      }

      const share0 = Number.parseFloat(ethers.formatUnits(reserve0, token0Details.decimals)) * (percentage / 100)
      const share1 = Number.parseFloat(ethers.formatUnits(reserve1, token1Details.decimals)) * (percentage / 100)

      return {
        share0: share0.toLocaleString(undefined, { maximumFractionDigits: 6 }),
        share1: share1.toLocaleString(undefined, { maximumFractionDigits: 6 }),
        percentage: percentage.toFixed(2),
      }
    } catch (error) {
      console.error("Error calculating liquidity share:", error)
      return { share0: "0", share1: "0", percentage: "0" }
    }
  }

  const isFavorite = () => {
    return favorites.some((pair) => pair.address === pairAddress)
  }

  const toggleFavorite = () => {
    if (!pairAddress || !token0Details.symbol || !token1Details.symbol) return

    const pairInfo = {
      address: pairAddress,
      name: `${token0Details.symbol}/${token1Details.symbol}`,
      timestamp: Date.now(),
    }

    const isFavoritePair = favorites.some((pair) => pair.address === pairAddress)

    let updatedFavorites
    if (isFavoritePair) {
      updatedFavorites = favorites.filter((pair) => pair.address !== pairAddress)
    } else {
      updatedFavorites = [...favorites, pairInfo]
    }

    setFavorites(updatedFavorites)
    localStorage.setItem("favoritePairs", JSON.stringify(updatedFavorites))
  }

  const prices = calculatePrice()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-4xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block relative mb-2">
            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-lg blur opacity-75 animate-pulse"></div>
            <h1 className="relative px-6 py-3 bg-slate-900 bg-opacity-90 rounded-lg text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">
              Uniswap V2 Explorer
            </h1>
          </div>
          <p className="text-gray-300 mt-2">Explore liquidity pools and token details on Uniswap V2</p>
        </div>

        {/* Search & Input Section */}
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
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
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
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
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

          <div className="mt-3 text-xs text-gray-400">
            Example: 0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc (WETH/USDC)
          </div>
        </div>

        {/* Results Section */}
        {token0 && token1 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Pair Overview */}
            <div className="bg-slate-800 bg-opacity-50 backdrop-blur-sm p-6 rounded-xl border border-slate-700 shadow-xl transition-all duration-300 hover:shadow-purple-500/10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">
                  {token0Details.symbol}/{token1Details.symbol} Pair
                </h2>
                <div className="flex items-center mt-2 md:mt-0">
                  <button
                    onClick={toggleFavorite}
                    className={`mr-2 p-1.5 rounded-lg transition-colors ${
                      isFavorite()
                        ? "bg-pink-500 bg-opacity-20 text-pink-400"
                        : "bg-slate-700 text-gray-400 hover:bg-slate-600"
                    }`}
                    title={isFavorite() ? "Remove from favorites" : "Add to favorites"}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill={isFavorite() ? "currentColor" : "none"}
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
                  </button>
                  <div className="relative mr-2">
                    <button
                      onClick={shareToClipboard}
                      className="p-1.5 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-gray-400 hover:text-white"
                      title="Share link to this pair"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                    </button>
                    {showShareTooltip && (
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-slate-700 rounded text-xs whitespace-nowrap animate-fadeIn">
                        Link copied!
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => copyToClipboard(pairAddress, "pair")}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      <span>{formatAddress(pairAddress)}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                    {copied === "pair" && (
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-slate-700 rounded text-xs animate-fadeIn">
                        Copied!
                      </span>
                    )}
                  </div>
                  <a
                    href={`https://etherscan.io/address/${pairAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 p-1.5 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Tabs */}
              <div className="mb-6 border-b border-slate-700">
                <div className="flex space-x-6 overflow-x-auto pb-1">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`pb-2 px-1 transition-all whitespace-nowrap ${
                      activeTab === "overview"
                        ? "text-pink-400 border-b-2 border-pink-400"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("reserves")}
                    className={`pb-2 px-1 transition-all whitespace-nowrap ${
                      activeTab === "reserves"
                        ? "text-pink-400 border-b-2 border-pink-400"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    Reserves
                  </button>
                  <button
                    onClick={() => setActiveTab("swap")}
                    className={`pb-2 px-1 transition-all whitespace-nowrap ${
                      activeTab === "swap"
                        ? "text-pink-400 border-b-2 border-pink-400"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    Swap Calculator
                  </button>
                  <button
                    onClick={() => setActiveTab("calculator")}
                    className={`pb-2 px-1 transition-all whitespace-nowrap ${
                      activeTab === "calculator"
                        ? "text-pink-400 border-b-2 border-pink-400"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    LP Calculator
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
                  <div className="bg-slate-900 bg-opacity-50 rounded-lg p-4 border border-slate-800 transform transition-all duration-300 hover:scale-105">
                    <h3 className="text-gray-400 text-sm mb-1">Total Supply</h3>
                    <p className="text-lg font-medium">{formatNumber(totalSupply)} LP</p>
                  </div>
                  <div className="bg-slate-900 bg-opacity-50 rounded-lg p-4 border border-slate-800 transform transition-all duration-300 hover:scale-105">
                    <h3 className="text-gray-400 text-sm mb-1">{token0Details.symbol} Reserve</h3>
                    <p className="text-lg font-medium">{formatNumber(reserve0, token0Details.decimals)}</p>
                  </div>
                  <div className="bg-slate-900 bg-opacity-50 rounded-lg p-4 border border-slate-800 transform transition-all duration-300 hover:scale-105">
                    <h3 className="text-gray-400 text-sm mb-1">{token1Details.symbol} Reserve</h3>
                    <p className="text-lg font-medium">{formatNumber(reserve1, token1Details.decimals)}</p>
                  </div>
                </div>
              )}

              {activeTab === "reserves" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                  <div className="flex justify-center items-center">
                    <canvas ref={chartRef} width="250" height="250"></canvas>
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <div className="w-4 h-4 bg-pink-500 rounded-full mr-2"></div>
                        <span className="text-sm">{token0Details.symbol}</span>
                      </div>
                      <p className="text-lg font-medium">{formatNumber(reserve0, token0Details.decimals)}</p>
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <div className="w-4 h-4 bg-indigo-500 rounded-full mr-2"></div>
                        <span className="text-sm">{token1Details.symbol}</span>
                      </div>
                      <p className="text-lg font-medium">{formatNumber(reserve1, token1Details.decimals)}</p>
                    </div>
                    <div className="mt-6 p-4 bg-slate-900 rounded-lg border border-slate-800">
                      <h4 className="text-sm text-gray-400 mb-2">Reserve Ratio</h4>
                      <div className="flex justify-between">
                        <span>1 {token0Details.symbol} =</span>
                        <span className="font-medium text-pink-400">
                          {prices.token0Price} {token1Details.symbol}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span>1 {token1Details.symbol} =</span>
                        <span className="font-medium text-indigo-400">
                          {prices.token1Price} {token0Details.symbol}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "swap" && (
                <div className="animate-fadeIn">
                  <div className="bg-slate-900 bg-opacity-50 rounded-lg p-6 border border-slate-800 mb-6">
                    <h3 className="text-lg font-medium text-white mb-4">Swap Calculator</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Input Amount</label>
                        <div className="flex">
                          <input
                            type="number"
                            value={swapAmount}
                            onChange={(e) => setSwapAmount(e.target.value)}
                            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                            placeholder="0.0"
                            min="0"
                            step="0.000001"
                          />
                          <button
                            className="px-4 py-2 bg-slate-700 border border-slate-700 rounded-r-lg text-white font-medium"
                            onClick={() => setSwapDirection(swapDirection === "0to1" ? "1to0" : "0to1")}
                          >
                            {swapDirection === "0to1" ? token0Details.symbol : token1Details.symbol}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <button
                          onClick={() => setSwapDirection(swapDirection === "0to1" ? "1to0" : "0to1")}
                          className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-all text-pink-400"
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
                              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                            />
                          </svg>
                        </button>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Expected Output</label>
                        <div className="flex">
                          <input
                            type="text"
                            value={expectedOutput}
                            readOnly
                            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-l-lg text-white"
                            placeholder="0.0"
                          />
                          <div className="px-4 py-2 bg-slate-700 border border-slate-700 rounded-r-lg text-white font-medium">
                            {swapDirection === "0to1" ? token1Details.symbol : token0Details.symbol}
                          </div>
                        </div>
                      </div>

                      {priceImpact && (
                        <div className="bg-slate-800 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Price Impact</span>
                            <span
                              className={`font-medium ${
                                Number.parseFloat(priceImpact) < 1
                                  ? "text-green-400"
                                  : Number.parseFloat(priceImpact) < 5
                                    ? "text-yellow-400"
                                    : "text-red-400"
                              }`}
                            >
                              {priceImpact}%
                            </span>
                          </div>
                          <div className="mt-2">
                            <div className="w-full bg-slate-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  Number.parseFloat(priceImpact) < 1
                                    ? "bg-green-400"
                                    : Number.parseFloat(priceImpact) < 5
                                      ? "bg-yellow-400"
                                      : "bg-red-400"
                                }`}
                                style={{ width: `${Math.min(Number.parseFloat(priceImpact) * 10, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="bg-slate-800 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Exchange Rate</span>
                          <span className="font-medium">
                            1 {swapDirection === "0to1" ? token0Details.symbol : token1Details.symbol} ={" "}
                            {swapDirection === "0to1" ? prices.token0Price : prices.token1Price}{" "}
                            {swapDirection === "0to1" ? token1Details.symbol : token0Details.symbol}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <a
                          href={`https://app.uniswap.org/#/swap?inputCurrency=${
                            swapDirection === "0to1" ? token0 : token1
                          }&outputCurrency=${swapDirection === "0to1" ? token1 : token0}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full py-3 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-lg text-white font-medium hover:opacity-90 transition-all text-center"
                        >
                          Trade on Uniswap
                        </a>
                        <p className="text-xs text-gray-400 text-center mt-2">
                          This is a simulation. Click above to perform actual swaps on Uniswap.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "calculator" && (
                <div className="animate-fadeIn">
                  <div className="bg-slate-900 bg-opacity-50 rounded-lg p-6 border border-slate-800 mb-6">
                    <h3 className="text-lg font-medium text-white mb-4">Liquidity Position Calculator</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Enter LP Token Amount</label>
                        <div className="flex">
                          <input
                            type="number"
                            value={lpAmount}
                            onChange={(e) => setLpAmount(e.target.value)}
                            placeholder="0.0"
                            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                          />
                        </div>
                      </div>

                      {lpAmount && Number.parseFloat(lpAmount) > 0 && (
                        <div className="mt-4 space-y-4">
                          <div className="bg-slate-800 p-4 rounded-lg">
                            <h4 className="text-sm text-gray-400 mb-2">Your Position</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-xs text-gray-400">Share of Pool</p>
                                <p className="text-lg font-medium">{calculateLiquidityShare(lpAmount).percentage}%</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">{token0Details.symbol}</p>
                                <p className="text-lg font-medium">{calculateLiquidityShare(lpAmount).share0}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">{token1Details.symbol}</p>
                                <p className="text-lg font-medium">{calculateLiquidityShare(lpAmount).share1}</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-800 p-4 rounded-lg">
                            <h4 className="text-sm text-gray-400 mb-2">Position Value</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-gray-400">In {token0Details.symbol}</p>
                                <p className="text-lg font-medium">
                                  {(
                                    Number.parseFloat(calculateLiquidityShare(lpAmount).share0) +
                                    Number.parseFloat(calculateLiquidityShare(lpAmount).share1) *
                                      Number.parseFloat(prices.token1Price)
                                  ).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">In {token1Details.symbol}</p>
                                <p className="text-lg font-medium">
                                  {(
                                    Number.parseFloat(calculateLiquidityShare(lpAmount).share1) +
                                    Number.parseFloat(calculateLiquidityShare(lpAmount).share0) *
                                      Number.parseFloat(prices.token0Price)
                                  ).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="text-sm text-gray-400 mt-2">
                        Enter the amount of LP tokens you own to calculate your share of the pool and the value of your
                        position.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 bg-slate-900 bg-opacity-50 rounded-lg p-4 border border-slate-800">
                <h3 className="text-gray-400 text-sm mb-2">Price Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center">
                    <span>1 {token0Details.symbol} =</span>
                    <span className="font-medium text-pink-400">
                      {prices.token0Price} {token1Details.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>1 {token1Details.symbol} =</span>
                    <span className="font-medium text-indigo-400">
                      {prices.token1Price} {token0Details.symbol}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-gray-400 text-sm mb-2">Historical Data</h3>
                <div className="bg-slate-900 bg-opacity-50 rounded-lg p-4 border border-slate-800">
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 mx-auto text-gray-500 mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                      <p className="text-gray-400">Historical data is available via the Uniswap subgraph</p>
                      <a
                        href={`https://info.uniswap.org/#/pools/${pairAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 px-3 py-1 bg-slate-800 rounded-lg text-pink-400 text-sm hover:bg-slate-700 transition-colors"
                      >
                        View on Uniswap Info
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Token Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Token 0 */}
              <div className="bg-slate-800 bg-opacity-50 backdrop-blur-sm p-6 rounded-xl border border-slate-700 shadow-xl transition-all duration-300 hover:shadow-pink-500/10 transform hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-pink-400">{token0Details.symbol}</h3>
                  <div className="flex items-center">
                    <div className="relative">
                      <button
                        onClick={() => copyToClipboard(token0, "token0")}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                      >
                        <span>{formatAddress(token0)}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                      {copied === "token0" && (
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-slate-700 rounded text-xs animate-fadeIn">
                          Copied!
                        </span>
                      )}
                    </div>
                    <a
                      href={`https://etherscan.io/token/${token0}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 p-1.5 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name</span>
                    <span>{token0Details.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Decimals</span>
                    <span>{token0Details.decimals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reserve</span>
                    <span>{formatNumber(reserve0, token0Details.decimals)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price</span>
                    <span>
                      1 {token0Details.symbol} = {prices.token0Price} {token1Details.symbol}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700">
                  <a
                    href={`https://app.uniswap.org/#/swap?inputCurrency=${token0}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2 bg-pink-500 bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors text-pink-400"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                    Trade on Uniswap
                  </a>
                </div>
              </div>

              {/* Token 1 */}
              <div className="bg-slate-800 bg-opacity-50 backdrop-blur-sm p-6 rounded-xl border border-slate-700 shadow-xl transition-all duration-300 hover:shadow-indigo-500/10 transform hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-indigo-400">{token1Details.symbol}</h3>
                  <div className="flex items-center">
                    <div className="relative">
                      <button
                        onClick={() => copyToClipboard(token1, "token1")}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                      >
                        <span>{formatAddress(token1)}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                      {copied === "token1" && (
                        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-slate-700 rounded text-xs animate-fadeIn">
                          Copied!
                        </span>
                      )}
                    </div>
                    <a
                      href={`https://etherscan.io/token/${token1}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 p-1.5 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name</span>
                    <span>{token1Details.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Decimals</span>
                    <span>{token1Details.decimals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reserve</span>
                    <span>{formatNumber(reserve1, token1Details.decimals)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price</span>
                    <span>
                      1 {token1Details.symbol} = {prices.token1Price} {token0Details.symbol}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700">
                  <a
                    href={`https://app.uniswap.org/#/swap?inputCurrency=${token1}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2 bg-indigo-500 bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors text-indigo-400"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                    Trade on Uniswap
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!token0 && !token1 && !isLoading && (
          <div className="bg-slate-800 bg-opacity-50 backdrop-blur-sm p-8 rounded-xl border border-slate-700 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-gray-500 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="text-xl font-medium text-white mb-2">Enter a Uniswap V2 Pair Address</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Enter a valid Uniswap V2 pair address to view detailed information about the liquidity pool and its
              tokens.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 text-center text-gray-500 text-sm">
          <p>Powered by Ethereum & Uniswap V2</p>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
                @keyframes blob {
                    0% {
                        transform: translate(0px, 0px) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                    100% {
                        transform: translate(0px, 0px) scale(1);
                    }
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-blob {
                    animation: blob 7s infinite;
                }
                
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out forwards;
                }
            `}</style>
    </div>
  )
}

export default UniswapV2

