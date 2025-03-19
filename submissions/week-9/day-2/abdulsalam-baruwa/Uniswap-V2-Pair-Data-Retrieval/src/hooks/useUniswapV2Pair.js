import { Contract, Interface } from "ethers";
import { useState } from "react";
import abi from "../ABI/abi.json";
import multicallAbi from "../ABI/multicallAbi.json";
import { getReadOnlyProvider } from "../utils";

export const useUniswapV2Pair = () => {
    const [pairData, setPairData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async (pairAddress) => {
        try {
            const gasLimit = 50000;
            const contractInterface = new Interface(abi);
            const multiCall = new Contract(
                "0x1F98415757620B543A52E61c46B32eB19261F984",
                multicallAbi,
                getReadOnlyProvider()
            );
            const calls = [
                {
                    target: pairAddress,
                    gasLimit: gasLimit,
                    callData: contractInterface.encodeFunctionData("token0", [])
                },
                {
                    target: pairAddress,
                    gasLimit: gasLimit,
                    callData: contractInterface.encodeFunctionData("token1", [])
                },
                {
                    target: pairAddress,
                    gasLimit: gasLimit,
                    callData: contractInterface.encodeFunctionData("getReserves", [])
                },
                {
                    target: pairAddress,
                    gasLimit: gasLimit,
                    callData: contractInterface.encodeFunctionData("totalSupply", [])
                }
            ]

            const results = await multiCall.multicall.staticCall(calls);
            console.log("Raw results:", JSON.stringify(results, (key, value) =>
                typeof value === 'bigint' ? value.toString() : value, 2));

            // Helper function to safely decode results
            const safelyDecode = (functionName, resultData) => {
                try {
                    // Extract the returned value directly
                    return contractInterface.decodeFunctionResult(functionName, resultData);
                } catch (e) {
                    console.error(`Error decoding ${functionName}:`, e);
                    return [null]; // Return null as fallback
                }
            };

            // Convert the results structure to a more manageable format
            // The results structure seems to have format where [1] contains the actual data array
            const resultsArray = results[1];

            if (!resultsArray || !Array.isArray(resultsArray)) {
                throw new Error("Invalid response format from multicall");
            }

            // Decode each result individually with proper error handling
            const decodedToken0 = safelyDecode("token0", resultsArray[0].returnData)[0];
            const decodedToken1 = safelyDecode("token1", resultsArray[1].returnData)[0];
            const decodedReserves = safelyDecode("getReserves", resultsArray[2].returnData);
            const decodedSupply = safelyDecode("totalSupply", resultsArray[3].returnData)[0];


            const tokenCalls = [
                {
                    target: decodedToken0,
                    gasLimit: gasLimit,
                    callData: contractInterface.encodeFunctionData("name", [])
                },
                {
                    target: decodedToken0,
                    gasLimit: gasLimit,
                    callData: contractInterface.encodeFunctionData("decimals", [])
                },
                {
                    target: decodedToken0,
                    gasLimit: gasLimit,
                    callData: contractInterface.encodeFunctionData("symbol", [])
                },
                {
                    target: decodedToken1,
                    gasLimit: gasLimit,
                    callData: contractInterface.encodeFunctionData("name", [])
                },
                {
                    target: decodedToken1,
                    gasLimit: gasLimit,
                    callData: contractInterface.encodeFunctionData("decimals", [])
                },
                {
                    target: decodedToken1,
                    gasLimit: gasLimit,
                    callData: contractInterface.encodeFunctionData("symbol", [])
                },

            ]


            const tokenResults = await multiCall.multicall.staticCall(tokenCalls);
            const tokenResultsArray = tokenResults[1];

            if (!tokenResultsArray || !Array.isArray(tokenResultsArray)) {
                throw new Error("Invalid token data from multicall");
            }

            // Decode token information
            const token0Name = safelyDecode("name", tokenResultsArray[0].returnData)[0];
            const token0Decimals = safelyDecode("decimals", tokenResultsArray[1].returnData)[0];
            const token0Symbol = safelyDecode("symbol", tokenResultsArray[2].returnData)[0];
            const token1Name = safelyDecode("name", tokenResultsArray[3].returnData)[0];
            const token1Decimals = safelyDecode("decimals", tokenResultsArray[4].returnData)[0];
            const token1Symbol = safelyDecode("symbol", tokenResultsArray[5].returnData)[0];

            // Create a structured object with all the data
            const formattedData = {
                pairAddress,
                token0: {
                    address: decodedToken0,
                    name: token0Name,
                    symbol: token0Symbol,
                    decimals: Number(token0Decimals)
                },
                token1: {
                    address: decodedToken1,
                    name: token1Name,
                    symbol: token1Symbol,
                    decimals: Number(token1Decimals)
                },
                reserves: {
                    reserve0: Number(decodedReserves[0]) / Math.pow(10, Number(token0Decimals)),
                    reserve1: Number(decodedReserves[1]) / Math.pow(10, Number(token1Decimals)),
                    blockTimestampLast: Number(decodedReserves[2])
                },
                totalSupply: Number(decodedSupply) / 1e18
            };

            setPairData(formattedData);
            setLoading(false);
            return formattedData;

        } catch (error) {
            console.error("Error fetching pair data:", error);
            setError(error.message || "Failed to fetch pair data");
            setLoading(false);
            return null;
        }
    };

    return { fetchData, pairData, loading, error };
};



