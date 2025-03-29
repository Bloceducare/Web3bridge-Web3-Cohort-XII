import { useUniswapV2Pair } from "./hooks/useUniswapV2Pair";
import { useState } from "react";
import "./App.css";

function App() {
  const [pairAddress, setPairAddress] = useState('');
  const [copiedText, setCopiedText] = useState('');
  const { fetchData, pairData, loading, error } = useUniswapV2Pair();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pairAddress.trim()) {
      await fetchData(pairAddress.trim());
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(text);
      setTimeout(() => setCopiedText(''), 2000);
    });
  };

  return (
    <div className="pair-data-container">
      <h2>Uniswap V2 Pair Analyzer</h2>
      
      <form onSubmit={handleSubmit} className="pair-form">
        <input
          type="text"
          value={pairAddress}
          onChange={(e) => setPairAddress(e.target.value)}
          placeholder="Enter Uniswap V2 pair address (0x...)"
          className="pair-input"
        />
        <button type="submit" disabled={loading} className="fetch-button">
          {loading ? 'Loading...' : 'Fetch Pair Data'}
        </button>
      </form>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Fetching pair data...</p>
        </div>
      )}

      {error && <div className="error-message">Error: {error}</div>}

      {pairData && !loading && !error && (
        <div>
          <h3 className="pair-title">Pair: {pairData.token0.symbol}/{pairData.token1.symbol}</h3>
          
          <div className="pair-data">
            <div className="data-card pair-address-card">
              <h4>Pair Address</h4>
              <p className="address-field">
                <span className="address-text">{pairData.pairAddress}</span>
                <button 
                  onClick={() => copyToClipboard(pairData.pairAddress)} 
                  className="copy-button"
                  title="Copy pair address"
                >
                  {copiedText === pairData.pairAddress ? '✓' : '📋'}
                </button>
              </p>
            </div>
            
            <div className="data-card reserves">
              <h4>Pool Data</h4>
              <p><strong>Reserves:</strong> {pairData.reserves.reserve0.toLocaleString()} {pairData.token0.symbol}</p>
              <p><strong>Reserves:</strong> {pairData.reserves.reserve1.toLocaleString()} {pairData.token1.symbol}</p>
              <p><strong>Total Supply:</strong> {pairData.totalSupply.toLocaleString()} LP Tokens</p>
              <p><strong>Price:</strong> 1 {pairData.token0.symbol} = {(pairData.reserves.reserve1 / pairData.reserves.reserve0).toFixed(6)} {pairData.token1.symbol}</p>
              <p><strong>Price:</strong> 1 {pairData.token1.symbol} = {(pairData.reserves.reserve0 / pairData.reserves.reserve1).toFixed(6)} {pairData.token0.symbol}</p>
            </div>
            
            <div className="token-cards-container">
              <div className="data-card">
                <h4>{pairData.token0.symbol} Token</h4>
                <p><strong>Name:</strong> {pairData.token0.name}</p>
                <p><strong>Symbol:</strong> {pairData.token0.symbol}</p>
                <p className="address-field">
                  <strong>Address:</strong> 
                  <span className="address-text">{pairData.token0.address}</span>
                  <button 
                    onClick={() => copyToClipboard(pairData.token0.address)} 
                    className="copy-button"
                    title="Copy address"
                  >
                    {copiedText === pairData.token0.address ? '✓' : '📋'}
                  </button>
                </p>
                <p><strong>Decimals:</strong> {pairData.token0.decimals}</p>
              </div>
              
              <div className="data-card">
                <h4>{pairData.token1.symbol} Token</h4>
                <p><strong>Name:</strong> {pairData.token1.name}</p>
                <p><strong>Symbol:</strong> {pairData.token1.symbol}</p>
                <p className="address-field">
                  <strong>Address:</strong> 
                  <span className="address-text">{pairData.token1.address}</span>
                  <button 
                    onClick={() => copyToClipboard(pairData.token1.address)} 
                    className="copy-button"
                    title="Copy address"
                  >
                    {copiedText === pairData.token1.address ? '✓' : '📋'}
                  </button>
                </p>
                <p><strong>Decimals:</strong> {pairData.token1.decimals}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;