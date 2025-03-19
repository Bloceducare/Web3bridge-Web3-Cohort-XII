// File: src/App.jsx
import { useState, useEffect } from "react";
import { fetchPairData } from "./utils/multicall";
import { ethers } from "ethers";
import {toast } from "react-toastify";

// Example pairs for quick access
const EXAMPLE_PAIRS = [
  {
    address: "0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852",
    description: "ETH/USDT",
  },
  {
    address: "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc",
    description: "ETH/USDC",
  },
  {
    address: "0xa478c2975ab1ea89e8196811f51a7b7ade33eb11",
    description: "ETH/DAI",
  },
];

function App() {
  const [pairAddress, setPairAddress] = useState("");
  const [pairData, setPairData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Function to handle example pair selection
  const handleExampleClick = (address) => {
    setPairAddress(address);
  };

  // Function to fetch pair data
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation for Ethereum address
    if (!ethers.isAddress(pairAddress)) {
      setError("Please enter a valid Ethereum address");
      toast.error("Please enter a valid Ethereum address");
      return;
    }

    setLoading(true);
    setError("");
    setPairData(null);

    // Show toast notification for loading state
    const toastId = toast.loading("Fetching pair data...");

    try {
      // Step 1: Notify user that we're starting the data retrieval
      console.log("Starting data retrieval process");

      // Step 2: Execute the multicall to fetch Uniswap V2 pair data
      const data = await fetchPairData(pairAddress);

      // Step 3: Update the UI with the fetched data
      setPairData(data);

      // Step 4: Show success notification
      toast.update(toastId, {
        render: "Pair data retrieved successfully!",
        type: toast.success,
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      console.error("Error:", err);
      setError(
        err.message ||
          "Failed to fetch pair data. Make sure this is a valid Uniswap V2 pair address."
      );

      // Show error notification
      toast.update(toastId, {
        render: err.message || "Failed to fetch pair data",
        type: toast.error,
        isLoading: false,
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value, decimals = 18) => {
    if (!value) return "0";
    try {
      return ethers.formatUnits(value, decimals);
    } catch (error) {
      console.error("Error formatting number:", error);
      return "0";
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Uniswap V2 Pair Data Explorer</h1>
        <p className="app-subtitle">
          Explore detailed information about Uniswap V2 pairs using Multicall
        </p>
      </header>

      <main className="main-content">
        <section className="search-section">
          <div className="card">
            <h2 className="card-title">Enter Pair Address</h2>
            <form onSubmit={handleSubmit} className="search-form">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Enter Uniswap V2 Pair Address (0x...)"
                  value={pairAddress}
                  onChange={(e) => setPairAddress(e.target.value)}
                  className="address-input"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className={`search-button ${
                    loading ? "button-disabled" : ""
                  }`}
                >
                  {loading ? "Loading..." : "Fetch Data"}
                </button>
              </div>
              {error && <p className="error-message">{error}</p>}
            </form>

            <div className="examples-section">
              <h3 className="examples-title">Example Pairs:</h3>
              <div className="example-buttons">
                {EXAMPLE_PAIRS.map((pair, index) => (
                  <button
                    key={index}
                    className="example-button"
                    onClick={() => handleExampleClick(pair.address)}
                  >
                    {pair.description}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {pairData && (
          <section className="results-section">
            <div className="card data-card">
              <h2 className="card-title">Pair Information</h2>
              <div className="pair-info-summary">
                <div className="pair-header">
                  <h3 className="pair-title">
                    {pairData.token0.symbol} / {pairData.token1.symbol}
                  </h3>
                  <span className="pair-address">{pairAddress}</span>
                </div>
                <div className="pair-liquidity-info">
                  <div className="liquidity-stat">
                    <span className="stat-label">LP Total Supply:</span>
                    <span className="stat-value">
                      {formatNumber(pairData.totalSupply)}
                    </span>
                  </div>
                  <div className="liquidity-stat">
                    <span className="stat-label">Last Updated:</span>
                    <span className="stat-value">
                      {new Date(
                        Number(pairData.reserves.blockTimestampLast) * 1000
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="tokens-container">
                <div className="token-card">
                  <h3 className="token-title">{pairData.token0.symbol}</h3>
                  <div className="token-details">
                    <div className="detail-item">
                      <span className="detail-label">Name:</span>
                      <span className="detail-value">
                        {pairData.token0.name}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Address:</span>
                      <span className="detail-value address">
                        {pairData.token0.address}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Decimals:</span>
                      <span className="detail-value">
                        {pairData.token0.decimals.toString()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Reserve:</span>
                      <span className="detail-value highlight">
                        {formatNumber(
                          pairData.reserves.reserve0,
                          pairData.token0.decimals
                        )}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Price:</span>
                      <span className="detail-value highlight">
                        1 {pairData.token0.symbol} ={" "}
                        {pairData.prices.token0Price} {pairData.token1.symbol}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="token-card">
                  <h3 className="token-title">{pairData.token1.symbol}</h3>
                  <div className="token-details">
                    <div className="detail-item">
                      <span className="detail-label">Name:</span>
                      <span className="detail-value">
                        {pairData.token1.name}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Address:</span>
                      <span className="detail-value address">
                        {pairData.token1.address}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Decimals:</span>
                      <span className="detail-value">
                        {pairData.token1.decimals.toString()}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Reserve:</span>
                      <span className="detail-value highlight">
                        {formatNumber(
                          pairData.reserves.reserve1,
                          pairData.token1.decimals
                        )}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Price:</span>
                      <span className="detail-value highlight">
                        1 {pairData.token1.symbol} ={" "}
                        {pairData.prices.token1Price} {pairData.token0.symbol}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>Uniswap V2 Pair Data Explorer - Using Multicall</p>
      </footer>
    </div>
  );
}

export default App;
