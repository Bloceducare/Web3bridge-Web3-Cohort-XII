"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { getReadOnlyProvider } from "../../utils/provider"
import SearchBar from "./SearchBar"
import PairOverview from "./PairOverview"
import TokenDetails from "./TokenDetails"
import TabsContainer from "./TabContainer"

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
  const [favorites, setFavorites] = useState([])
  const [shareLink, setShareLink] = useState("")
  const [showShareTooltip, setShowShareTooltip] = useState(false)

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

      const multiCallContractABI = (await import("../../ABI/multicall.json")).default
      const uniswapV2PairABI = (await import("../../ABI/uniswap.json")).default

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

      const multiCallContractABI = (await import("../../ABI/multicall.json")).default
      const tokenABI = (await import("../../ABI/erc20.json")).default

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

        {/* Search Bar */}
        <SearchBar
          pairAddress={pairAddress}
          setPairAddress={setPairAddress}
          error={error}
          isLoading={isLoading}
          getPairData={getPairData}
          recentPairs={recentPairs}
          favorites={favorites}
          setFavorites={setFavorites}
        />

        {/* Results Section */}
        {token0 && token1 && (
          <div className="space-y-6 animate-fadeIn">
            {/* Pair Overview */}
            <PairOverview
              pairAddress={pairAddress}
              token0Details={token0Details}
              token1Details={token1Details}
              isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
              shareLink={shareLink}
              shareToClipboard={shareToClipboard}
              showShareTooltip={showShareTooltip}
              copyToClipboard={copyToClipboard}
              copied={copied}
            >
              <TabsContainer
                token0={token0}
                token1={token1}
                token0Details={token0Details}
                token1Details={token1Details}
                reserve0={reserve0}
                reserve1={reserve1}
                totalSupply={totalSupply}
                formatNumber={formatNumber}
                prices={prices}
              />
            </PairOverview>

            {/* Token Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Token 0 */}
              <TokenDetails
                token={token0}
                tokenDetails={token0Details}
                reserve={reserve0}
                price={`1 ${token0Details.symbol} = ${prices.token0Price} ${token1Details.symbol}`}
                formatNumber={formatNumber}
                copyToClipboard={copyToClipboard}
                copied={copied === "token0"}
                colorClass="text-pink-400"
                hoverColorClass="hover:shadow-pink-500/10"
                bgColorClass="bg-pink-500 bg-opacity-20 hover:bg-opacity-30"
                copyType="token0"
              />

              {/* Token 1 */}
              <TokenDetails
                token={token1}
                tokenDetails={token1Details}
                reserve={reserve1}
                price={`1 ${token1Details.symbol} = ${prices.token1Price} ${token0Details.symbol}`}
                formatNumber={formatNumber}
                copyToClipboard={copyToClipboard}
                copied={copied === "token1"}
                colorClass="text-indigo-400"
                hoverColorClass="hover:shadow-indigo-500/10"
                bgColorClass="bg-indigo-500 bg-opacity-20 hover:bg-opacity-30"
                copyType="token1"
              />
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

