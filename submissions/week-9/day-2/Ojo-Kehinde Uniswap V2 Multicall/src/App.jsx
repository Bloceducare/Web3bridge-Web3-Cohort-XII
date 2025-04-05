import React, { useState } from "react";
import UniswapPairData from "./components/UniswapPairData";
import { FaEthereum } from "react-icons/fa";

function App() {
  const [pairAddress, setPairAddress] = useState("");
  const [submittedAddress, setSubmittedAddress] = useState("");
  const [showData, setShowData] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.error("error");
    if (pairAddress) {
      setSubmittedAddress(pairAddress);
      setShowData(true);
    } else {
      setError("Please enter a valid Ethereum address");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FaEthereum className="text-yellow-400" />
            DEX Pair Finder
          </h1>
          <p className="mt-2 text-blue-100">
            Discover details of Uniswap V2 liquidity pairs
          </p>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="pairAddress"
                className="block text-lg font-medium text-blue-300"
              >
                Enter Uniswap V2 Pair Address
              </label>
              <input
                type="text"
                id="pairAddress"
                value={pairAddress}
                onChange={(e) => setPairAddress(e.target.value)}
                className={`w-full px-4 py-3 bg-gray-700 border rounded-md focus:ring-blue-500 focus:border-blue-500 text-white ${
                  error ? "border-red-500" : "border-gray-600"
                }`}
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-3 rounded-md font-medium flex items-center justify-center gap-2"
            >
              <FaEthereum />
              Fetch Data
            </button>
          </form>
        </div>

        {showData && (
          <div className="mt-8 bg-gray-800 rounded-lg shadow-xl p-6">
            <UniswapPairData pairAddress={submittedAddress} />
          </div>
        )}
      </main>

      <footer className="bg-gray-800 p-4 text-center text-gray-400 mt-12">
        © 2025 Uniswap Pair Explorer | Made by DEX Pair Finder
      </footer>
    </div>
  );
}

export default App;
