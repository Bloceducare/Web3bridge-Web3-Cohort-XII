import React, { useState, useEffect } from "react";
import { useAppContext } from "./contexts/AppContext";

const App = () => {
  const { pairData, loading, error, fetchContractData } = useAppContext();
  const [pairAddress, setPairAddress] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchContractData(pairAddress);
  };

  useEffect(() => {
    if (pairAddress) {
      fetchContractData(pairAddress);
    }
  }, [pairAddress, fetchContractData]);

  return (
    <div>
      <h1>Uniswap V2 Pair Explorer</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={pairAddress}
          onChange={(e) => setPairAddress(e.target.value)}
          placeholder="Enter Uniswap V2 Pair Address"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Fetch Pair Data"}
        </button>
      </form>

      {error && <p>{error}</p>}

      {pairData && (
        <div>
          <h2>Pair Data</h2>
          <p>Token 0: {pairData.token0.name} ({pairData.token0.symbol})</p>
          <p>Token 1: {pairData.token1.name} ({pairData.token1.symbol})</p>
          <p>Reserves: {pairData.reserves.reserve0} / {pairData.reserves.reserve1}</p>
          <p>Total Supply: {pairData.totalSupply}</p>
        </div>
      )}
    </div>
  );
};

export default App;
