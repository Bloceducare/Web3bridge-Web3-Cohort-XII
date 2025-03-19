import { createContext, useContext, useState } from "react";
import { Contract, Interface } from "ethers";

import uniswapV2PairABI from "../abi/V2Pair.json";
import erc20ABI from "../abi/erc20ABI.json";
import multicallABI from "../abi/multicall.json";
import { getReadOnlyProvider } from "../utils/utils";

//Create Context
const appContext = createContext(null);

export const useAppContext = () => {
  const context = useContext(appContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

//AppProvider Component
export const AppProvider = ({ children }) => {
  const [pairData, setPairData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch contract data
  const fetchContractData = async (pairAddress) => {
    if (!pairAddress) return;

    setLoading(true);
    setError(null);
    setPairData(null);

    try {
        //Get provider (from utils)
      const provider = getReadOnlyProvider(); 
      const contractInterface = new Interface(uniswapV2PairABI); // Uniswap V2 Pair contract ABI
      const erc20Interface = new Interface(erc20ABI); // ERC-20 token contract ABI

      const multicall = new Contract(
        import.meta.env.VITE_MULTICALL_CONTRACT_ADDRESS,
        multicallABI,
        provider
      );

      // Prepare calls for multicall
      const calls = [
        { target: pairAddress, callData: contractInterface.encodeFunctionData("token0") },
        { target: pairAddress, callData: contractInterface.encodeFunctionData("token1") },
        { target: pairAddress, callData: contractInterface.encodeFunctionData("getReserves") },
        { target: pairAddress, callData: contractInterface.encodeFunctionData("totalSupply") },
      ];

      // Execute multicall
      const results = await multicall.aggregate.staticCall(calls);
      const resultsArray = results[1];

      const token0 = contractInterface.decodeFunctionResult("token0", resultsArray[0])[0];
      const token1 = contractInterface.decodeFunctionResult("token1", resultsArray[1])[0];
      const getReserves = contractInterface.decodeFunctionResult("getReserves", resultsArray[2]);
      const totalSupply = contractInterface.decodeFunctionResult("totalSupply", resultsArray[3]);

      // Fetch token details for token0 and token1
      const tokenDetailsCalls = [
        { target: token0, callData: erc20Interface.encodeFunctionData("name") },
        { target: token0, callData: erc20Interface.encodeFunctionData("symbol") },
        { target: token0, callData: erc20Interface.encodeFunctionData("decimals") },
        { target: token1, callData: erc20Interface.encodeFunctionData("name") },
        { target: token1, callData: erc20Interface.encodeFunctionData("symbol") },
        { target: token1, callData: erc20Interface.encodeFunctionData("decimals") },
      ];

      const tokenDetailsResults = await multicall.aggregate.staticCall(tokenDetailsCalls);
      const tokenDetailsResultsArray = tokenDetailsResults[1];

      const token0Name = erc20Interface.decodeFunctionResult("name", tokenDetailsResultsArray[0])[0];
      const token0Symbol = erc20Interface.decodeFunctionResult("symbol", tokenDetailsResultsArray[1])[0];
      const token0Decimals = erc20Interface.decodeFunctionResult("decimals", tokenDetailsResultsArray[2])[0];

      const token1Name = erc20Interface.decodeFunctionResult("name", tokenDetailsResultsArray[3])[0];
      const token1Symbol = erc20Interface.decodeFunctionResult("symbol", tokenDetailsResultsArray[4])[0];
      const token1Decimals = erc20Interface.decodeFunctionResult("decimals", tokenDetailsResultsArray[5])[0];

      const reserve0 = Number(getReserves[0]) / (10 ** Number(token0Decimals));
      const reserve1 = Number(getReserves[1]) / (10 ** Number(token1Decimals));
      const totalSupplyFormatted = Number(totalSupply) / (10 ** 18); 

      const data = {
        pairAddress,
        token0: {
          address: token0,
          name: token0Name,
          symbol: token0Symbol,
          decimals: token0Decimals,
          reserve: reserve0,
        },
        token1: {
          address: token1,
          name: token1Name,
          symbol: token1Symbol,
          decimals: token1Decimals,
          reserve: reserve1,
        },
        reserves: {
          reserve0: getReserves[0].toString(),
          reserve1: getReserves[1].toString(),
          blockTimestampLast: getReserves[2],
        },
        totalSupply: totalSupplyFormatted,
        totalSupplyRaw: totalSupply.toString(),
      };

      setPairData(data);
    } catch (error) {
      console.log("error:", error);
      setError(`Failed to fetch pair data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    pairData,
    loading,
    error,
    fetchContractData,
  };

  return <appContext.Provider value={value}>{children}</appContext.Provider>;
};
