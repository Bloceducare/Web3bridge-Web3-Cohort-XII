import React, { useState } from 'react';
import { ethers } from 'ethers';
import { MULTICALL_ABI, MULTICALL_ADDRESS, PAIR_ABI, ERC20_ABI } from './constants';
import './App.css';

function App() {
  const [pairAddress, setPairAddress] = useState('');
  const [pairData, setPairData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPairData = async () => {
    if (!ethers.utils.isAddress(pairAddress)) {
      setError('Please enter a valid Ethereum address');
      return;
    }
  
    setIsLoading(true);
    setError('');
    setPairData(null);
  
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        "https://eth-mainnet.g.alchemy.com/v2/Q9s0PwqqKVW-EMs00Us2791nRHuo9MxK"
      );
      
      const multicall = new ethers.Contract(
        MULTICALL_ADDRESS,
        MULTICALL_ABI,
        provider
      );
      
      const pairInterface = new ethers.utils.Interface(PAIR_ABI);
      const erc20Interface = new ethers.utils.Interface(ERC20_ABI);
      
      const tokenCallData = [
        { target: pairAddress, callData: pairInterface.encodeFunctionData("token0") },
        { target: pairAddress, callData: pairInterface.encodeFunctionData("token1") },
        { target: pairAddress, callData: pairInterface.encodeFunctionData("getReserves") },
        { target: pairAddress, callData: pairInterface.encodeFunctionData("totalSupply") },
      ];
      
      const [_, tokenResults] = await multicall.callStatic.aggregate(tokenCallData);
      
      // Check if any call failed
      const failedCalls = tokenResults.map((result, i) => 
        result === "0x" ? tokenCallData[i].callData.slice(0, 10) : null
      ).filter(Boolean);
      if (failedCalls.length > 0) {
        throw new Error(`Multicall failed for: ${failedCalls.join(", ")}. Invalid pair address?`);
      }
      
      const token0Address = pairInterface.decodeFunctionResult("token0", tokenResults[0])[0];
      const token1Address = pairInterface.decodeFunctionResult("token1", tokenResults[1])[0];
      const reserves = pairInterface.decodeFunctionResult("getReserves", tokenResults[2]);
      const totalSupply = pairInterface.decodeFunctionResult("totalSupply", tokenResults[3])[0];
      
      const tokenDetailsCallData = [
        { target: token0Address, callData: erc20Interface.encodeFunctionData("name") },
        { target: token0Address, callData: erc20Interface.encodeFunctionData("symbol") },
        { target: token0Address, callData: erc20Interface.encodeFunctionData("decimals") },
        { target: token1Address, callData: erc20Interface.encodeFunctionData("name") },
        { target: token1Address, callData: erc20Interface.encodeFunctionData("symbol") },
        { target: token1Address, callData: erc20Interface.encodeFunctionData("decimals") },
      ];
      
      const [__, detailsResults] = await multicall.callStatic.aggregate(tokenDetailsCallData);
      
      const failedTokenCalls = detailsResults.map((result, i) => 
        result === "0x" ? tokenDetailsCallData[i].callData.slice(0, 10) : null
      ).filter(Boolean);
      if (failedTokenCalls.length > 0) {
        throw new Error(`Token detail calls failed for: ${failedTokenCalls.join(", ")}.`);
      }
      
      const token0Name = erc20Interface.decodeFunctionResult("name", detailsResults[0])[0];
      const token0Symbol = erc20Interface.decodeFunctionResult("symbol", detailsResults[1])[0];
      const token0Decimals = erc20Interface.decodeFunctionResult("decimals", detailsResults[2])[0];
      const token1Name = erc20Interface.decodeFunctionResult("name", detailsResults[3])[0];
      const token1Symbol = erc20Interface.decodeFunctionResult("symbol", detailsResults[4])[0];
      const token1Decimals = erc20Interface.decodeFunctionResult("decimals", detailsResults[5])[0];
      
      setPairData({
        token0: {
          address: token0Address,
          name: token0Name,
          symbol: token0Symbol,
          decimals: token0Decimals,
          reserve: ethers.utils.formatUnits(reserves.reserve0, token0Decimals),
        },
        token1: {
          address: token1Address,
          name: token1Name,
          symbol: token1Symbol,
          decimals: token1Decimals,
          reserve: ethers.utils.formatUnits(reserves.reserve1, token1Decimals),
        },
        totalSupply: ethers.utils.formatEther(totalSupply),
        pairAddress,
      });
    } catch (err) {
      console.error("Error fetching pair data:", err);
      setError(err.message || 'Error fetching pair data. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="container">
      <h1>Uniswap V2 Pair Explorer</h1>
      <p className="description">
        Enter a Uniswap V2 pair address to retrieve information using multicall.
      </p>
      
      <div className="input-container">
        <input
          type="text"
          value={pairAddress}
          onChange={(e) => setPairAddress(e.target.value)}
          placeholder="0x... (Uniswap V2 Pair Address)"
        />
        <button onClick={fetchPairData} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Fetch Data'}
        </button>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      {pairData && (
        <div className="results">
          <h2>Pair Information</h2>
          <div className="pair-info">
            <div className="info-row">
              <span>Pair Address:</span>
              <span className="address">{pairData.pairAddress}</span>
            </div>
            <div className="info-row">
              <span>Total Supply:</span>
              <span>{pairData.totalSupply} LP</span>
            </div>
          </div>
          
          <h3>Token Information</h3>
          <div className="token-container">
            <div className="token-card">
              <h4>{pairData.token0.name} ({pairData.token0.symbol})</h4>
              <div className="info-row">
                <span>Address:</span>
                <span className="address">{pairData.token0.address}</span>
              </div>
              <div className="info-row">
                <span>Decimals:</span>
                <span>{pairData.token0.decimals}</span>
              </div>
              <div className="info-row">
                <span>Reserve:</span>
                <span>{pairData.token0.reserve}</span>
              </div>
            </div>
            
            <div className="token-card">
              <h4>{pairData.token1.name} ({pairData.token1.symbol})</h4>
              <div className="info-row">
                <span>Address:</span>
                <span className="address">{pairData.token1.address}</span>
              </div>
              <div className="info-row">
                <span>Decimals:</span>
                <span>{pairData.token1.decimals}</span>
              </div>
              <div className="info-row">
                <span>Reserve:</span>
                <span>{pairData.token1.reserve}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="footer">
        <p>Example V2 pair: 0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc (USDC-WETH)</p>
      </div>
    </div>
  );
}

export default App;