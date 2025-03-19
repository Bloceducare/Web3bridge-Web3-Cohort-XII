import React, { useState } from 'react';
import { Contract, Interface, ethers } from 'ethers';
import ERC20Abi from "../Abi/ERC20Abi.json";
import MulticallAbi from "../Abi/MulticallAbi.json";
import Uniswapv2Abi from "../Abi/Uniswapv2Abi.json";
import { getReadOnlyProvider } from "../utilis/utilis";

const Index = () => {
    const [token0, setToken0] = useState("");
    const [token1, setToken1] = useState("");
    const [reserves0, setReserves0] = useState("");
    const [reserves1, setReserves1] = useState("");
    const [totalSupply, setTotalSupply] = useState("");
    const [uniswapv2Address, setUniswapv2Address] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [token0Name, setToken0Name] = useState("");
    const [token1Name, setToken1Name] = useState("");
    const [token0Symbol, setToken0Symbol] = useState("");
    const [token1Symbol, setToken1Symbol] = useState("");
    const [token0Decimals, setToken0Decimals] = useState("");
    const [token1Decimals, setToken1Decimals] = useState("");

    const multicallAddress = "0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696";

    const fetchData = async () => {
        setError("");
        setLoading(true);

        try {
            const provider = getReadOnlyProvider();
            const multicallContract = new Contract(multicallAddress, MulticallAbi, provider);
            const uniswapInterface = new Interface(Uniswapv2Abi);

            const calls = [
                { target: uniswapv2Address, callData: uniswapInterface.encodeFunctionData("token0") },
                { target: uniswapv2Address, callData: uniswapInterface.encodeFunctionData("token1") },
                { target: uniswapv2Address, callData: uniswapInterface.encodeFunctionData("getReserves") },
                { target: uniswapv2Address, callData: uniswapInterface.encodeFunctionData("totalSupply") }
            ];

            const { returnData } = await multicallContract.aggregate.staticCall(calls);

            const Token0 = uniswapInterface.decodeFunctionResult("token0", returnData[0])[0];
            const Token1 = uniswapInterface.decodeFunctionResult("token1", returnData[1])[0];
            const Reserves = uniswapInterface.decodeFunctionResult("getReserves", returnData[2]);
            const TotalSupply = uniswapInterface.decodeFunctionResult("totalSupply", returnData[3])[0];

            setReserves0(Reserves[0].toString());
            setReserves1(Reserves[1].toString());
            setTotalSupply(TotalSupply.toString());
            setToken0(Token0);
            setToken1(Token1);
            const tokenDetails0 = await tokenDetails(Token0);
            const tokenDetails1 = await tokenDetails(Token1);
            setToken0Name(tokenDetails0.name);
            setToken1Name(tokenDetails1.name);
            setToken0Symbol(tokenDetails0.symbol);
            setToken1Symbol(tokenDetails1.symbol);
            setToken0Decimals(tokenDetails0.decimals);
            setToken1Decimals(tokenDetails1.decimals);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to fetch data. Check the UniswapV2 address and try again.");
        } finally {
            setLoading(false);
        }
    };

    const tokenDetails = async (address) => {
        try {
            const provider = getReadOnlyProvider();
            const tokenContract = new Contract(multicallAddress, MulticallAbi, provider);
            const uniswapInterface = new Interface(ERC20Abi);

            const calls = [
                { target: address, callData: uniswapInterface.encodeFunctionData("name") },
                { target: address, callData: uniswapInterface.encodeFunctionData("symbol") },
                { target: address, callData: uniswapInterface.encodeFunctionData("decimals") }
            ];

            const { returnData } = await tokenContract.aggregate.staticCall(calls);

            const name = uniswapInterface.decodeFunctionResult("name", returnData[0])[0];
            const symbol = uniswapInterface.decodeFunctionResult("symbol", returnData[1])[0];
            const decimals = uniswapInterface.decodeFunctionResult("decimals", returnData[2])[0];

            return { name, symbol, decimals };
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to fetch data. Check the UniswapV2 address and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white font-sans p-8">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    Uniswap V2 Explorer
                </h1>
                <p className="text-gray-400 mt-2">Explore Uniswap V2 Pair Data</p>
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
                {/* Input Section */}
                <div className="w-full lg:w-1/3 bg-gray-800 p-8 rounded-xl shadow-2xl backdrop-blur-sm bg-opacity-50 border border-gray-700 hover:border-cyan-400 transition-all">
                    <h2 className="text-2xl font-bold text-cyan-400 mb-6">Enter Pair Address</h2>
                    <input
                        type="text"
                        placeholder="UniswapV2 Address"
                        value={uniswapv2Address}
                        onChange={(e) => setUniswapv2Address(e.target.value)}
                        className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    />
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="w-full mt-6 p-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? "Fetching..." : "Fetch Data"}
                    </button>
                </div>

                {/* Data Display Section */}
                <div className="w-full lg:w-2/3 bg-gray-800 p-8 rounded-xl shadow-2xl backdrop-blur-sm bg-opacity-50 border border-gray-700 hover:border-cyan-400 transition-all">
                    <h2 className="text-2xl font-bold text-cyan-400 mb-6">Pair Details</h2>
                    {error && (
                        <div className="mb-6 p-4 bg-red-900 text-red-200 rounded-lg">
                            {error}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-all">
                            <p className="text-sm text-gray-400">Token 0</p>
                            <p className="text-lg font-bold">{token0 || "N/A"}</p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-all">
                            <p className="text-sm text-gray-400">Token 1</p>
                            <p className="text-lg font-bold">{token1 || "N/A"}</p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-all">
                            <p className="text-sm text-gray-400">Reserves 0</p>
                            <p className="text-lg font-bold">{reserves0 || "N/A"}</p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-all">
                            <p className="text-sm text-gray-400">Reserves 1</p>
                            <p className="text-lg font-bold">{reserves1 || "N/A"}</p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-all">
                            <p className="text-sm text-gray-400">Total Supply</p>
                            <p className="text-lg font-bold">{totalSupply || "N/A"}</p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-all">
                            <p className="text-sm text-gray-400">Token 0 Name</p>
                            <p className="text-lg font-bold">{token0Name || "N/A"}</p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-all">
                            <p className="text-sm text-gray-400">Token 0 Symbol</p>
                            <p className="text-lg font-bold">{token0Symbol || "N/A"}</p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-all">
                            <p className="text-sm text-gray-400">Token 0 Decimals</p>
                            <p className="text-lg font-bold">{token0Decimals || "N/A"}</p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-all">
                            <p className="text-sm text-gray-400">Token 1 Name</p>
                            <p className="text-lg font-bold">{token1Name || "N/A"}</p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-all">
                            <p className="text-sm text-gray-400">Token 1 Symbol</p>
                            <p className="text-lg font-bold">{token1Symbol || "N/A"}</p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-all">
                            <p className="text-sm text-gray-400">Token 1 Decimals</p>
                            <p className="text-lg font-bold">{token1Decimals || "N/A"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Index;