import { ethers } from "ethers";
import { createContext, useContext, useEffect, useState } from "react";
import { getReadOnlyProvider } from "../utils";
import UNISWAP_V2_PAIR_ABI from "../ABI/UniswapV2Pair.json";
import ERC20_ABI from "../ABI/ERC20.json";
import MULTICALL_ABI from "../ABI/multicall2.json";


const MULTICALL_ADDRESS = "0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696"; // Ethereum Mainnet Multicall2

const pairDataContext = createContext();

export const usePairDataContext = () => {
    const context = useContext(pairDataContext);
    if (!context) {
        throw new Error("usePairDataContext must be used within a PairDataProvider");
    }
    return context;
};

export const PairDataProvider = ({ children }) => {
    const [pairAddress, setPairAddress] = useState("");
    const [pairData, setPairData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const fetchPairData = async (address) => {
        if (!address || !address.startsWith("0x")) {
            setError("Please enter a valid Ethereum address");
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setPairData(null);
        
        try {
            const provider = getReadOnlyProvider();
            const pairInterface = new ethers.utils.Interface(UNISWAP_V2_PAIR_ABI);
            const erc20Interface = new ethers.utils.Interface(ERC20_ABI);
            
            const multicall = new ethers.Contract(
                MULTICALL_ADDRESS,
                MULTICALL_ABI,
                provider
            );
            
            // First batch of calls to get token addresses and reserves
            const initialCalls = [
                {
                    target: address,
                    callData: pairInterface.encodeFunctionData("token0")
                },
                {
                    target: address,
                    callData: pairInterface.encodeFunctionData("token1")
                },
                {
                    target: address,
                    callData: pairInterface.encodeFunctionData("getReserves")
                },
                {
                    target: address,
                    callData: pairInterface.encodeFunctionData("totalSupply")
                }
            ];
            
            const [, initialResultsArray] = await multicall.callStatic.aggregate(initialCalls);
            
            const token0Address = pairInterface.decodeFunctionResult("token0", initialResultsArray[0])[0];
            const token1Address = pairInterface.decodeFunctionResult("token1", initialResultsArray[1])[0];
            const reserves = pairInterface.decodeFunctionResult("getReserves", initialResultsArray[2]);
            const totalSupply = pairInterface.decodeFunctionResult("totalSupply", initialResultsArray[3])[0];
            
            // Second batch of calls to get token details
            const tokenDetailsCalls = [
                {
                    target: token0Address,
                    callData: erc20Interface.encodeFunctionData("name")
                },
                {
                    target: token0Address,
                    callData: erc20Interface.encodeFunctionData("symbol")
                },
                {
                    target: token0Address,
                    callData: erc20Interface.encodeFunctionData("decimals")
                },
                {
                    target: token1Address,
                    callData: erc20Interface.encodeFunctionData("name")
                },
                {
                    target: token1Address,
                    callData: erc20Interface.encodeFunctionData("symbol")
                },
                {
                    target: token1Address,
                    callData: erc20Interface.encodeFunctionData("decimals")
                }
            ];
            
            const [, tokenDetailsResultsArray] = await multicall.callStatic.aggregate(tokenDetailsCalls);
            
            const token0Name = erc20Interface.decodeFunctionResult("name", tokenDetailsResultsArray[0])[0];
            const token0Symbol = erc20Interface.decodeFunctionResult("symbol", tokenDetailsResultsArray[1])[0];
            const token0Decimals = erc20Interface.decodeFunctionResult("decimals", tokenDetailsResultsArray[2])[0];
            
            const token1Name = erc20Interface.decodeFunctionResult("name", tokenDetailsResultsArray[3])[0];
            const token1Symbol = erc20Interface.decodeFunctionResult("symbol", tokenDetailsResultsArray[4])[0];
            const token1Decimals = erc20Interface.decodeFunctionResult("decimals", tokenDetailsResultsArray[5])[0];
            
            setPairData({
                address,
                token0: {
                    address: token0Address,
                    name: token0Name,
                    symbol: token0Symbol,
                    decimals: token0Decimals,
                    reserve: reserves.reserve0
                },
                token1: {
                    address: token1Address,
                    name: token1Name,
                    symbol: token1Symbol,
                    decimals: token1Decimals,
                    reserve: reserves.reserve1
                },
                totalSupply,
                lastK: reserves.reserve0 * reserves.reserve1,
                blockTimestampLast: reserves.blockTimestampLast
            });
        } catch (error) {
            console.error("Failed to fetch pair data:", error);
            setError("Failed to fetch pair data. Please ensure this is a valid Uniswap V2 pair address.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <pairDataContext.Provider
            value={{
                pairAddress,
                setPairAddress,
                pairData,
                isLoading,
                error,
                fetchPairData
            }}
        >
            {children}
        </pairDataContext.Provider>
    );
};