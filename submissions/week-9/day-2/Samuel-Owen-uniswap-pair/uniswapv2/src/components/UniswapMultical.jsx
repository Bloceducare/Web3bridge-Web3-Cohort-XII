import { useState } from "react";
import { ethers } from "ethers";


// These are Uniswap V2 pair and ERC20 interfaces
const UNISWAP_PAIR_ABI = [
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function getReserves() view returns (uint112, uint112, uint32)",
  "function totalSupply() view returns (uint256)"
];
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

// Example Uniswap V2 pair: WETH-USDT
const DEFAULT_PAIR = "0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852";

export default function UniswapPairInfo() {
  const [pairAddress, setPairAddress] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPairInfo = async () => {
    // Use the input address or default to a known working pair
    const targetAddress = pairAddress || DEFAULT_PAIR;
    
    if (!ethers.isAddress(targetAddress)) {
      setError("Invalid address format");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      // Using Infura's public endpoint
      const provider = new ethers.JsonRpcProvider("https://mainnet.infura.io/v3/84842078b09946638c03157f83405213");
      
      // Create contract instance with the PAIR address
      const pairContract = new ethers.Contract(targetAddress, UNISWAP_PAIR_ABI, provider);
      
      // Fetch token addresses
      const [token0, token1] = await Promise.all([
        pairContract.token0(),
        pairContract.token1()
      ]);
      
      // Fetch reserves and total supply
      const [reserves, totalSupply] = await Promise.all([
        pairContract.getReserves(),
        pairContract.totalSupply()
      ]);
      
      // Fetch token details
      const token0Contract = new ethers.Contract(token0, ERC20_ABI, provider);
      const token1Contract = new ethers.Contract(token1, ERC20_ABI, provider);
      
      const [token0Name, token0Symbol, token0Decimals, token1Name, token1Symbol, token1Decimals] = await Promise.all([
        token0Contract.name(),
        token0Contract.symbol(),
        token0Contract.decimals(),
        token1Contract.name(),
        token1Contract.symbol(),
        token1Contract.decimals()
      ]);
      
      setData({
        pairAddress: targetAddress,
        token0: { address: token0, name: token0Name, symbol: token0Symbol, decimals: token0Decimals },
        token1: { address: token1, name: token1Name, symbol: token1Symbol, decimals: token1Decimals },
        reserves: { 
          reserve0: ethers.formatUnits(reserves[0], token0Decimals), 
          reserve1: ethers.formatUnits(reserves[1], token1Decimals) 
        },
        totalSupply: ethers.formatEther(totalSupply)
      });
    } catch (error) {
      console.error(error);
      setError("Error fetching data: " + error.message);
    }
    setLoading(false);
  };

  // Function to truncate addresses
  const truncateAddress = (address) => {
    return address.slice(0, 6) + '...' + address.slice(-4);
  };

  return (
    <div className="app-container">
      <div className="app-content">
        {/* Header */}
        <div className="header">
          <h1 className="title">Uniswap V2 Pair </h1>
          <p className="subtitle">Analyze liquidity pairs and token data from Uniswap V2</p>
        </div>
        
        {/* Search Box */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Enter Uniswap V2 Pair Address (e.g. 0x0d4a11d5...)"
            className="address-input"
            value={pairAddress}
            onChange={(e) => setPairAddress(e.target.value)}
          />
          <button
            className={`fetch-button ${loading ? 'loading' : ''}`}
            onClick={fetchPairInfo}
            disabled={loading}
          >
            {loading ? (
              <div className="spinner"></div>
            ) : (
              "Fetch Pair Info"
            )}
          </button>
          
          {error && <div className="error-message">{error}</div>}
        </div>
        
        {/* Results */}
        {data && (
          <div className="results-container">
            <div className="pair-header">
              <h2 className="pair-title">Pair Information</h2>
              <div className="pair-address">
                <span className="label">Address:</span> 
                <span className="value">{truncateAddress(data.pairAddress)}</span>
              </div>
            </div>
            
            <div className="token-containers">
              <div className="token-card token0">
                <h3 className="token-title">Token 0</h3>
                <div className="token-symbol">{data.token0.symbol}</div>
                <div className="token-name">{data.token0.name}</div>
                <div className="token-detail">
                  <span className="label">Address:</span> 
                  <span className="value">{truncateAddress(data.token0.address)}</span>
                </div>
                <div className="token-detail">
                  <span className="label">Decimals:</span> 
                  <span className="value">{data.token0.decimals}</span>
                </div>
                <div className="token-detail">
                  <span className="label">Reserve:</span> 
                  <span className="value">{parseFloat(data.reserves.reserve0).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="token-card token1">
                <h3 className="token-title">Token 1</h3>
                <div className="token-symbol">{data.token1.symbol}</div>
                <div className="token-name">{data.token1.name}</div>
                <div className="token-detail">
                  <span className="label">Address:</span> 
                  <span className="value">{truncateAddress(data.token1.address)}</span>
                </div>
                <div className="token-detail">
                  <span className="label">Decimals:</span> 
                  <span className="value">{data.token1.decimals}</span>
                </div>
                <div className="token-detail">
                  <span className="label">Reserve:</span> 
                  <span className="value">{parseFloat(data.reserves.reserve1).toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="pool-info">
              <h3 className="pool-title">Pool Information</h3>
              <div className="pool-detail">
                <span className="label">Total Supply:</span> 
                <span className="value">{parseFloat(data.totalSupply).toLocaleString()} LP Tokens</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}