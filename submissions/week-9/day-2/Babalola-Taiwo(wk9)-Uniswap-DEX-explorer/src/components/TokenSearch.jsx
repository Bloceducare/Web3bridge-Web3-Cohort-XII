"use client"

import { useState } from "react"
import { fetchSingleTokenData, formatTokenAmount } from "../utils/multicall"

export function TokenSearch() {
  const [tokenAddress, setTokenAddress] = useState("")
  const [tokenData, setTokenData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")


  const exampleTokens = [
    {
      name: "WETH",
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    },
    {
      name: "USDC",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    },
    {
      name: "WBTC",
      address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    },
    {
      name: "DAI",
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    },
    {
      name: "UNI",
      address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    },
    {
      name: "LINK",
      address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    },
  ]   // Example tokens for user convenience

  const handleSearch = async (e) => {
    e.preventDefault()

    if (!tokenAddress || !tokenAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      setError("Please enter a valid token address")
      return
    }

    setLoading(true)
    setError("")
    setTokenData(null)

    try {
      const data = await fetchSingleTokenData(tokenAddress)
      setTokenData(data)
    } catch (err) {
      console.error("Error:", err)
      setError(err.message || "Failed to fetch token data")
    } finally {
      setLoading(false)
    }
  }

  const handleExampleTokenClick = (address) => {
    setTokenAddress(address)
  }

  return (
    <div>
      <section className="example-section glass-card">
        <h2>Popular Tokens</h2>
        <div className="example-tokens">
          {exampleTokens.map((token) => (
            <button
              key={token.address}
              onClick={() => handleExampleTokenClick(token.address)}
              className="example-token"
            >
              {token.name}
            </button>
          ))}
        </div>
      </section>

      <div className="token-search glass-card">
        <form onSubmit={handleSearch} className="search-form">
          
           
              <label htmlFor="tokenAddress" className="form-label">
                Token Address
              </label>
              <div className="form-group-2">
                <input
                  id="tokenAddress"
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  placeholder="0x..."
                  className="form-input form-input-2"
                />
            

              <button type="submit" disabled={loading} className="button">
                {loading ? "Searching..." : "Search Token"}
              </button>
            </div>

          
        </form>

        {error && <div className="error-message">{error}</div>}

        {loading && (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
            <p>Fetching token data...</p>
          </div>
        )}

        {tokenData && (
          <div className="token-result">
            <div className="token-header">
              <div className="token-icon-large">{tokenData.symbol.charAt(0)}</div>
              <div className="token-title">
                <h3>{tokenData.name}</h3>
                <span className="token-symbol">{tokenData.symbol}</span>
              </div>
            </div>

            <div className="token-details">
              <div className="token-detail">
                <span className="token-detail-label">Address: </span>
                <span className="token-address">{tokenData.address}</span>
              </div>
              <div className="token-detail">
                <span className="token-detail-label">Decimals:</span>
                <span>{tokenData.decimals}</span>
              </div>
              <div className="token-detail">
                <span className="token-detail-label">Total Supply:</span>
                <span>
                  {formatTokenAmount(tokenData.totalSupply, tokenData.decimals)} {tokenData.symbol}
                </span>
              </div>
              <div className="token-detail">
                <span className="token-detail-label">Binance Balance:</span>
                <span>
                  {formatTokenAmount(tokenData.balances.binance, tokenData.decimals)} {tokenData.symbol}
                </span>
              </div>
              <div className="token-detail">
                <span className="token-detail-label">Uniswap Balance:</span>
                <span>
                  {formatTokenAmount(tokenData.balances.uniswap, tokenData.decimals)} {tokenData.symbol}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

