import { useState } from "react";
import { ethers, isAddress } from "ethers";
import "./index.css";

const UNISWAP_V2_PAIR_ABI = [
  "function getReserves() external view returns (uint112, uint112, uint32)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function totalSupply() external view returns (uint256)",
];

const ERC20_ABI = [
  "function symbol() external view returns (string)",
  "function name() external view returns (string)",
  "function decimals() external view returns (uint8)",
];

const RPC_URL = "https://mainnet.infura.io/v3/YOUR_API_KEY";

const App = () => {
  const [pairAddress, setPairAddress] = useState("");
  const [pairData, setPairData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPairData = async (e) => {
    e.preventDefault();
    if (!isAddress(pairAddress)) {
      setError("Invalid Ethereum address");
      return;
    }

    setLoading(true);
    setError("");
    setPairData(null);

    try {
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const pairContract = new ethers.Contract(pairAddress, UNISWAP_V2_PAIR_ABI, provider);

      let reserve0, reserve1;
      try {
        [reserve0, reserve1] = await pairContract.getReserves();
      } catch (err) {
        throw new Error("Failed to get reserves. Ensure this is a valid Uniswap V2 pair.");
      }

      const token0Address = await pairContract.token0();
      const token1Address = await pairContract.token1();
      const totalSupply = await pairContract.totalSupply();

      const token0Contract = new ethers.Contract(token0Address, ERC20_ABI, provider);
      const token1Contract = new ethers.Contract(token1Address, ERC20_ABI, provider);

      const [symbol0, name0, decimals0] = await Promise.all([
        token0Contract.symbol(),
        token0Contract.name(),
        token0Contract.decimals(),
      ]);

      const [symbol1, name1, decimals1] = await Promise.all([
        token1Contract.symbol(),
        token1Contract.name(),
        token1Contract.decimals(),
      ]);

      setPairData({
        token0: { symbol: symbol0, name: name0, decimals: decimals0, reserve: reserve0.toString() },
        token1: { symbol: symbol1, name: name1, decimals: decimals1, reserve: reserve1.toString() },
        totalSupply: totalSupply.toString(),
        pairAddress,
      });
    } catch (err) {
      setError("Failed to fetch pair data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Uniswap V2 Explorer</h2>
      <form onSubmit={fetchPairData}>
        <input
          type="text"
          placeholder="Enter Uniswap V2 Pair Address"
          value={pairAddress}
          onChange={(e) => setPairAddress(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>{loading ? "Loading..." : "Fetch Data"}</button>
      </form>
      {error && <div className="error">{error}</div>}
      {pairData && (
        <div className="card">
          <h3>Pair Information</h3>
          <p><strong>Address:</strong> {pairData.pairAddress}</p>
          <p><strong>Total Supply:</strong> {pairData.totalSupply} LP Tokens</p>
          <h4>Token 0</h4>
          <p>{pairData.token0.symbol} - {pairData.token0.name}</p>
          <p><strong>Reserve:</strong> {pairData.token0.reserve}</p>
          <h4>Token 1</h4>
          <p>{pairData.token1.symbol} - {pairData.token1.name}</p>
          <p><strong>Reserve:</strong> {pairData.token1.reserve}</p>
        </div>
      )}
    </div>
  );
};

export default App;
