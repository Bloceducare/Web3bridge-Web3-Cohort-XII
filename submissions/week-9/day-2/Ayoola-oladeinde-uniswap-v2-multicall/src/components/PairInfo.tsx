import { useState } from "react";
import { ethers } from "ethers";
import { getPairData } from "../../utils/uniswap";
import React from "react";
const PairInfo = () => {
    const [pairAddress, setPairAddress] = useState("");
    const [pairData, setPairData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
  
    const fetchPairDetails = async () => {
      setLoading(true);
      setError("");
      setPairData(null);
  
      try {
       

  
        const data = await getPairData( pairAddress);
        if (!data) {
          throw new Error("Invalid pair address or no data found.");
        }
  
        setPairData(data);
      } catch (err) {
        setError("Failed to fetch pair details. Ensure the address is correct.");
        console.error(err);
      }
  
      setLoading(false);
    };
  
    return (
      <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
        <h2 className="text-2xl font-bold text-center text-gray-700">
          Uniswap V2 Pair Info
        </h2>
  
        <div className="mt-4">
          <input
            type="text"
            placeholder="Enter Uniswap V2 Pair Address"
            value={pairAddress}
            onChange={(e) => setPairAddress(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchPairDetails}
            className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition"
            disabled={loading}
          >
            {loading ? "Fetching..." : "Get Pair Details"}
          </button>
        </div>
  
        {error && <p className="mt-4 text-red-500">{error}</p>}
  
        {pairData && (
          <div className="mt-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-xl font-semibold text-gray-700">Pair Details</h3>
            <p className="mt-2"><strong>Pair Address:</strong> {pairData.pairAddress}</p>
  
            <h4 className="mt-4 text-lg font-semibold text-gray-700">Token 0</h4>
            <p><strong>Name:</strong> {pairData.token0.name}</p>
            <p><strong>Symbol:</strong> {pairData.token0.symbol}</p>
            <p><strong>Decimals:</strong> {pairData.token0.decimals}</p>
            <p><strong>Address:</strong> {pairData.token0.address}</p>
  
            <h4 className="mt-4 text-lg font-semibold text-gray-700">Token 1</h4>
            <p><strong>Name:</strong> {pairData.token1.name}</p>
            <p><strong>Symbol:</strong> {pairData.token1.symbol}</p>
            <p><strong>Decimals:</strong> {pairData.token1.decimals}</p>
            <p><strong>Address:</strong> {pairData.token1.address}</p>
  
            <p><strong>Reserves</strong> {pairData.reserves}</p>
        
            <h4 className="mt-4 text-lg font-semibold text-gray-700">Total Supply</h4>
            <p>{pairData.totalSupply}</p>
          </div>
        )}
      </div>
    );
  };
  
  export default PairInfo;