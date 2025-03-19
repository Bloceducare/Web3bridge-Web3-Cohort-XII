"use client"

import { useState } from "react"
import { fetchPairDataDirect, formatTokenAmount } from "../utils/multicall"

export function PairSearch() {
  const [pairAddress, setPairAddress] = useState("")
  const [pairData, setPairData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  
  const examplePairs = [
    {
      name: "WETH-USDC",
      address: "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc",
    },
    {
      name: "WETH-DAI",
      address: "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11",
    },
    {
      name: "WBTC-WETH",
      address: "0xBb2b8038a1640196FbE3e38816F3e67Cba72D940",
    },
    {
      name: "USDC-DAI",
      address: "0xAE461cA67B15dc8dc81CE7615e0320dA1A9aB8D5",
    },
  ] 

  const handleSearch = async (e) => {
    e.preventDefault()

    if (!pairAddress || !pairAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError("Please enter a valid pair address")
      return
    }

    setLoading(true)
    setError("")
    setPairData(null)

    try {
      const data = await fetchPairDataDirect(pairAddress)
      setPairData(data)
    } catch (err) {
      console.error("Error:", err)
      setError(err.message || "Failed to fetch pair data")
    } finally {
      setLoading(false)
    }
  }

  const handleExamplePairClick = (address) => {
    setPairAddress(address)
  }

  // function to handle BigInt values properly
  const calculatePriceRatio = (pairData) => {
    if (!pairData) return "0"

    try {
      // Convert reserves to strings first, then to numbers with proper decimal adjustment
      const reserve0 = pairData.reserves.reserve0.toString()
      const reserve1 = pairData.reserves.reserve1.toString()

      const token0Amount = Number(reserve0) / Math.pow(10, Number(pairData.token0.decimals))
      const token1Amount = Number(reserve1) / Math.pow(10, Number(pairData.token1.decimals))

      return (token1Amount / token0Amount).toFixed(6)
    } catch (error) {
      console.error("Error calculating price ratio:", error)
      return "Error calculating ratio"  // Calculates and format the ratio
    }
  }

  return (
    <div>
      <section className="example-section glass-card">
        <h2>Popular Pairs</h2>
        <div className="example-tokens">
          {examplePairs.map((pair) => (
            <button key={pair.address} onClick={() => handleExamplePairClick(pair.address)} className="example-token">
              {pair.name}
            </button>
          ))}
        </div>
      </section>

      <div className="form-container glass-card">
        <form onSubmit={handleSearch} className="p-6">
          <div className="form-group">
            <label htmlFor="pairAddress" className="form-label">
              Uniswap V2 Pair Address
            </label>
            <input
              id="pairAddress"
              type="text"
              value={pairAddress}
              onChange={(e) => setPairAddress(e.target.value)}
              placeholder="0x..."
              className="form-input"
            />
          </div>

          <button type="submit" disabled={loading} className="button button-full">
            {loading ? "Fetching Data..." : "Explore Pair"}
          </button>

          {error && <div className="error-message">{error}</div>}
        </form>
      </div>

      {loading && (
        <div className="loading glass-card">
          <div className="loading-spinner"></div>
          <p>Fetching pair data from the blockchain...</p>
        </div>
      )}

      {pairData && (
        <div className="results-container">
          <div className="results-header">
            <h2>Pair Information</h2>
            <p className="results-address">{pairData.pairAddress}</p>
          </div>

          <div className="results-content">
            <div className="results-grid">
              {/* Token 0 Information */}
              <div className="token-card">
                <h3>
                  <div className="token-icon">{pairData.token0.symbol.charAt(0)}</div>
                  {pairData.token0.name} ({pairData.token0.symbol})
                </h3>
                <div className="token-details">
                  <div className="token-detail">
                    <span className="token-detail-label">Symbol:</span>
                    <span>{pairData.token0.symbol}</span>
                  </div>
                  <div className="token-detail">
                    <span className="token-detail-label">Decimals:</span>
                    <span>{pairData.token0.decimals}</span>
                  </div>
                  <div className="token-detail">
                    <span className="token-detail-label">Address:</span>
                    <span className="token-address">{pairData.token0.address}</span>
                  </div>
                  <div className="token-detail">
                    <span className="token-detail-label">Reserve:</span>
                    <span>
                      {formatTokenAmount(pairData.reserves.reserve0, pairData.token0.decimals)} {pairData.token0.symbol}
                    </span>
                  </div>
                </div>
              </div>

              {/* Token 1 Information */}
              <div className="token-card">
                <h3>
                  <div className="token-icon">{pairData.token1.symbol.charAt(0)}</div>
                  {pairData.token1.name} ({pairData.token1.symbol})
                </h3>
                <div className="token-details">
                  <div className="token-detail">
                    <span className="token-detail-label">Symbol:</span>
                    <span>{pairData.token1.symbol}</span>
                  </div>
                  <div className="token-detail">
                    <span className="token-detail-label">Decimals:</span>
                    <span>{pairData.token1.decimals}</span>
                  </div>
                  <div className="token-detail">
                    <span className="token-detail-label">Address:</span>
                    <span className="token-address">{pairData.token1.address}</span>
                  </div>
                  <div className="token-detail">
                    <span className="token-detail-label">Reserve:</span>
                    <span>
                      {formatTokenAmount(pairData.reserves.reserve1, pairData.token1.decimals)} {pairData.token1.symbol}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pair Details */}
            <div className="pair-details">
              <h3>Liquidity Information</h3>
              <div className="token-details">
                <div className="token-detail">
                  <span className="token-detail-label">Total Supply:</span>
                  <span>{formatTokenAmount(pairData.totalSupply, 18)} LP Tokens</span>
                </div>
                <div className="token-detail">
                  <span className="token-detail-label">Pair Contract:</span>
                  <span className="token-address">{pairData.pairAddress}</span>
                </div>
              </div>

              <div className="price-ratio">
                1 {pairData.token0.symbol} = {calculatePriceRatio(pairData)} {pairData.token1.symbol}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

