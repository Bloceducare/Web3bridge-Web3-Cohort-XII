import { Interface, Contract, formatUnits, formatEther } from "ethers";
import React, { useState, useEffect } from "react";
import V2 from "./ABI/uniswapV2.json";
import ERC20 from "./ABI/erc20.json";
import MULTICALL_ABI from "./ABI/multicall.json";
import { getReadOnlyProvider } from "./utils";

const App = () => {
  const [pairAddress, setPairAddress] = useState("");
  const [token0, setToken0] = useState("");
  const [token1, setToken1] = useState("");
  const [reserves, setReserves] = useState({});
  const [totalSupply, setTotalSupply] = useState("");
  const [token0Details, setToken0Details] = useState({});
  const [token1Details, setToken1Details] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasData, setHasData] = useState(false);

  const MULTICALL_ADDRESS = import.meta.env.VITE_MULTICALL_CA_ADDRESS;
  const provider = getReadOnlyProvider();

  const getV2PairData = async () => {
    if (!pairAddress) {
      setError("Please enter a Uniswap V2 pair address");
      return;
    }

    setLoading(true);
    setError("");
    setHasData(false);

    try {
      const v2Interface = new Interface(V2);
      const erc20Interface = new Interface(ERC20);
      const multicall = new Contract(
        MULTICALL_ADDRESS,
        MULTICALL_ABI,
        provider
      );

      // First call: Get token0, token1, reserves, totalSupply
      const pairCalls = [
        {
          target: pairAddress,
          callData: v2Interface.encodeFunctionData("token0", []),
        },
        {
          target: pairAddress,
          callData: v2Interface.encodeFunctionData("token1", []),
        },
        {
          target: pairAddress,
          callData: v2Interface.encodeFunctionData("getReserves", []),
        },
        {
          target: pairAddress,
          callData: v2Interface.encodeFunctionData("totalSupply", []),
        },
      ];

      const pairResults = await multicall.aggregate.staticCall(pairCalls);
      const [token0Address, token1Address, reservesData, totalSupplyData] =
        pairResults[1];

      const token0Decoded = v2Interface.decodeFunctionResult(
        "token0",
        token0Address
      )[0];
      const token1Decoded = v2Interface.decodeFunctionResult(
        "token1",
        token1Address
      )[0];
      const reservesDecoded = v2Interface.decodeFunctionResult(
        "getReserves",
        reservesData
      );
      const totalSupplyDecoded = v2Interface.decodeFunctionResult(
        "totalSupply",
        totalSupplyData
      )[0];

      setToken0(token0Decoded);
      setToken1(token1Decoded);
      setReserves({
        reserve0: reservesDecoded[0],
        reserve1: reservesDecoded[1],
        blockTimestampLast: reservesDecoded[2],
      });
      setTotalSupply(formatEther(totalSupplyDecoded));

      // Second call: Get Token0 & Token1 details
      const tokenCalls = [
        {
          target: token0Decoded,
          callData: erc20Interface.encodeFunctionData("name", []),
        },
        {
          target: token0Decoded,
          callData: erc20Interface.encodeFunctionData("symbol", []),
        },
        {
          target: token0Decoded,
          callData: erc20Interface.encodeFunctionData("decimals", []),
        },
        {
          target: token1Decoded,
          callData: erc20Interface.encodeFunctionData("name", []),
        },
        {
          target: token1Decoded,
          callData: erc20Interface.encodeFunctionData("symbol", []),
        },
        {
          target: token1Decoded,
          callData: erc20Interface.encodeFunctionData("decimals", []),
        },
      ];

      const tokenResults = await multicall.aggregate.staticCall(tokenCalls);
      const [
        token0Name,
        token0Symbol,
        token0Decimals,
        token1Name,
        token1Symbol,
        token1Decimals,
      ] = tokenResults[1];

      const token0DecimalsValue = erc20Interface.decodeFunctionResult(
        "decimals",
        token0Decimals
      )[0];

      const token1DecimalsValue = erc20Interface.decodeFunctionResult(
        "decimals",
        token1Decimals
      )[0];

      setToken0Details({
        name: erc20Interface.decodeFunctionResult("name", token0Name)[0],
        symbol: erc20Interface.decodeFunctionResult("symbol", token0Symbol)[0],
        decimals: token0DecimalsValue,
        formattedReserve: formatUnits(reservesDecoded[0], token0DecimalsValue),
      });

      setToken1Details({
        name: erc20Interface.decodeFunctionResult("name", token1Name)[0],
        symbol: erc20Interface.decodeFunctionResult("symbol", token1Symbol)[0],
        decimals: token1DecimalsValue,
        formattedReserve: formatUnits(reservesDecoded[1], token1DecimalsValue),
      });

      setHasData(true);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(
        "Failed to fetch pool data. Please check the address and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      getV2PairData();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Uniswap V2 Pool Explorer
          </h1>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-sm text-gray-400">Mainnet</span>
          </div>
        </div>

        {/* Search Container */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={pairAddress}
                onChange={(e) => setPairAddress(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter Uniswap V2 Pair Address"
                className="bg-gray-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-200"
              />
            </div>
            <button
              onClick={getV2PairData}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg py-3 px-6 md:w-auto w-full transition-all duration-200 flex items-center justify-center"
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : null}
              {loading ? "Loading..." : "Fetch Pool Data"}
            </button>
          </div>

          {error && (
            <div className="mt-4 text-red-400 text-sm flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* Results Container */}
        {hasData && (
          <div className="space-y-6">
            {/* Pool Overview */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Pool Overview
              </h2>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Pair Address</span>
                    <div className="flex items-center bg-gray-900 px-3 py-1 rounded-md">
                      <span className="text-sm font-mono">{`${pairAddress.substring(
                        0,
                        6
                      )}...${pairAddress.substring(
                        pairAddress.length - 4
                      )}`}</span>
                      <button
                        className="ml-2 text-gray-400 hover:text-purple-400"
                        onClick={() =>
                          navigator.clipboard.writeText(pairAddress)
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">LP Token Supply</span>
                    <span className="font-medium">
                      {parseFloat(totalSupply).toLocaleString(undefined, {
                        maximumFractionDigits: 6,
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Token Ratio</span>
                    <span className="font-medium">
                      1 {token0Details.symbol} ={" "}
                      {(
                        parseFloat(token1Details.formattedReserve) /
                        parseFloat(token0Details.formattedReserve)
                      ).toLocaleString(undefined, {
                        maximumFractionDigits: 6,
                      })}{" "}
                      {token1Details.symbol}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Pool Value</span>
                    <div className="flex items-center">
                      <span className="font-medium text-green-400">$</span>
                      <span className="font-medium">---.--</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Token Reserves */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Token 0 */}
              <div className="flex-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mr-3">
                    <span className="font-bold">
                      {token0Details.symbol
                        ? token0Details.symbol.charAt(0)
                        : "?"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {token0Details.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {token0Details.symbol}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Reserve</span>
                    <span className="font-medium">
                      {parseFloat(
                        token0Details.formattedReserve
                      ).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Token Address</span>
                    <div className="flex items-center bg-gray-900 px-3 py-1 rounded-md">
                      <span className="text-sm font-mono">{`${token0.substring(
                        0,
                        6
                      )}...${token0.substring(token0.length - 4)}`}</span>
                      <button
                        className="ml-2 text-gray-400 hover:text-purple-400"
                        onClick={() => navigator.clipboard.writeText(token0)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Decimals</span>
                    <span className="font-medium">
                      {token0Details.decimals?.toString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Token 1 */}
              <div className="flex-1 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mr-3">
                    <span className="font-bold">
                      {token1Details.symbol
                        ? token1Details.symbol.charAt(0)
                        : "?"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {token1Details.name}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {token1Details.symbol}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Reserve</span>
                    <span className="font-medium">
                      {parseFloat(
                        token1Details.formattedReserve
                      ).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Token Address</span>
                    <div className="flex items-center bg-gray-900 px-3 py-1 rounded-md">
                      <span className="text-sm font-mono">{`${token1.substring(
                        0,
                        6
                      )}...${token1.substring(token1.length - 4)}`}</span>
                      <button
                        className="ml-2 text-gray-400 hover:text-purple-400"
                        onClick={() => navigator.clipboard.writeText(token1)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Decimals</span>
                    <span className="font-medium">
                      {token1Details.decimals?.toString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasData && !loading && !error && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-12 text-center shadow-lg">
            <div className="mx-auto w-16 h-16 mb-6 bg-gray-700/50 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-300 mb-2">
              No Pool Data
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Enter a valid Uniswap V2 pair address above to view detailed pool
              information
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Powered by Uniswap V2 Protocol • Made with 💙</p>
        </div>
      </div>
    </div>
  );
};

export default App;
