import { useEthersProvider } from "../config/ethers";
import { Contract, Interface, ethers } from "ethers";
import UNISWAP_ABI from "../abi/uniswapV2.json";
import ERC20ABI from "../abi/erc20.json";
import MULTICALL_ABI from "../abi/multicall.json";
import { useEffect, useState } from "react";

export function UniswapViewer() {
    const provider = useEthersProvider({ chainId: 1 });
    const [token0, setToken0] = useState();
    const [token1, setToken1] = useState();
    const [token0Reserves, setToken0Reserves] = useState();
    const [token1Reserves, setToken1Reserves] = useState();
    const [totalSupply, setTotalSupply] = useState();
    const [pairDecimals, setPairDecimals] = useState();
    const [pairAddress, setPairAddress] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [token0Decimals, setToken0Decimals] = useState();
    const [token1Decimals, setToken1Decimals] = useState();
    const [token0Name, setToken0Name] = useState();
    const [token1Name, setToken1Name] = useState();
    const [token0Symbol, setToken0Symbol] = useState();
    const [token1Symbol, setToken1Symbol] = useState();
    const [isLoading, setIsLoading] = useState(false);

    const multicall = new Contract(
        "0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696", // Multicall contract address
        MULTICALL_ABI,
        provider
    );

    async function getTokenDetails(tokenAddress) {
        const tokenInterface = new Interface(ERC20ABI);

        const calls = [
            {
                target: tokenAddress,
                callData: tokenInterface.encodeFunctionData("decimals", []),
            },
            {
                target: tokenAddress,
                callData: tokenInterface.encodeFunctionData("name", []),
            },
            {
                target: tokenAddress,
                callData: tokenInterface.encodeFunctionData("symbol", []),
            },
        ];

        try {
            const results = await multicall.aggregate.staticCall(calls);
            const [, returnData] = results;

            const tokenDecimals = tokenInterface.decodeFunctionResult("decimals", returnData[0]);
            const tokenName = tokenInterface.decodeFunctionResult("name", returnData[1]);
            const tokenSymbol = tokenInterface.decodeFunctionResult("symbol", returnData[2]);

            return { tokenDecimals, tokenName, tokenSymbol };
        } catch (error) {
            console.error("Error fetching token details:", error);
            return { tokenDecimals: null, tokenName: null, tokenSymbol: null };
        }
    }

    async function getPairDetails(pairAddress) {
        setIsLoading(true);
        const pairInterface = new Interface(UNISWAP_ABI);

        const calls = [
            {
                target: pairAddress,
                callData: pairInterface.encodeFunctionData("token0", []),
            },
            {
                target: pairAddress,
                callData: pairInterface.encodeFunctionData("token1", []),
            },
            {
                target: pairAddress,
                callData: pairInterface.encodeFunctionData("getReserves", []),
            },
            {
                target: pairAddress,
                callData: pairInterface.encodeFunctionData("totalSupply", []),
            },
            {
                target: pairAddress,
                callData: pairInterface.encodeFunctionData("decimals", []),
            },
        ];

        try {
            const results = await multicall.aggregate.staticCall(calls);
            const [, returnData] = results;

            const token0 = pairInterface.decodeFunctionResult("token0", returnData[0]);
            const token1 = pairInterface.decodeFunctionResult("token1", returnData[1]);
            const reserves = pairInterface.decodeFunctionResult("getReserves", returnData[2]);
            const totalSupply = pairInterface.decodeFunctionResult("totalSupply", returnData[3]);
            const pairDecimals = pairInterface.decodeFunctionResult("decimals", returnData[4]);

            const token0Reserves = reserves[0];
            const token1Reserves = reserves[1];

            const token0Details = await getTokenDetails(token0[0]);
            const token1Details = await getTokenDetails(token1[0]);

            setToken0(token0);
            setToken1(token1);
            setToken0Name(token0Details.tokenName);
            setToken1Name(token1Details.tokenName);
            setToken0Symbol(token0Details.tokenSymbol);
            setToken1Symbol(token1Details.tokenSymbol);
            setToken0Decimals(token0Details.tokenDecimals);
            setToken1Decimals(token1Details.tokenDecimals);
            setToken0Reserves(ethers.formatUnits(token0Reserves, token0Details.tokenDecimals[0]));
            setToken1Reserves(ethers.formatUnits(token1Reserves, token1Details.tokenDecimals[0]));
            setTotalSupply(ethers.formatUnits(totalSupply.toString(), pairDecimals[0]));
            setPairDecimals(pairDecimals[0]);
        } catch (error) {
            console.error("Error fetching pair details:", error);
        } finally {
            setIsLoading(false); 
        }
    }

    useEffect(() => {
        if (pairAddress) {
            getPairDetails(pairAddress);
            setInputValue("");
        }
    }, [pairAddress]);

    return (
        <div className="bg-[#415A77] min-h-screen flex items-center justify-center p-4">
            <div className="bg-[#E0E1DD] rounded-lg shadow-lg p-8 w-full max-w-4xl">
                {/* Input Section */}
                <div className="flex items-center space-x-4 mb-8">
                    <input
                        type="text"
                        placeholder="Enter Pair Address"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="flex-1 border-2 border-[#415A77] rounded-lg p-2 focus:outline-none focus:border-[#778DA9]"
                    />
                    <button
                        onClick={() => setPairAddress(inputValue)}
                        className="bg-[#415A77] hover:bg-[#778DA9] text-[#E0E1DD] font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        disabled={isLoading} // Disable button while loading
                    >
                        {isLoading ? "Loading..." : "Load Pair"}
                    </button>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center mb-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#415A77]"></div>
                    </div>
                )}

                {/* Token Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-lg p-6 shadow-md">
                        <h2 className="text-xl font-bold text-[#415A77] mb-4">Token 0</h2>
                        <p className="text-[#415A77]">
                            Address: <span className="font-mono break-all">{token0}</span>
                        </p>
                        <p className="text-[#415A77]">Name: {token0Name}</p>
                        <p className="text-[#415A77]">Symbol: {token0Symbol}</p>
                        <p className="text-[#415A77]">Decimals: {token0Decimals}</p>
                        <p className="text-[#415A77]">Reserves: {token0Reserves}</p>
                    </div>
                    <div className="bg-white rounded-lg p-6 shadow-md">
                        <h2 className="text-xl font-bold text-[#415A77] mb-4">Token 1</h2>
                        <p className="text-[#415A77]">
                            Address: <span className="font-mono break-all">{token1}</span>
                        </p>
                        <p className="text-[#415A77]">Name: {token1Name}</p>
                        <p className="text-[#415A77]">Symbol: {token1Symbol}</p>
                        <p className="text-[#415A77]">Decimals: {token1Decimals}</p>
                        <p className="text-[#415A77]">Reserves: {token1Reserves}</p>
                    </div>
                </div>

                {/* Pair Details Section */}
                <div className="mt-8 bg-white rounded-lg p-6 shadow-md">
                    <h2 className="text-xl font-bold text-[#415A77] mb-4">Pair Details</h2>
                    <p className="text-[#415A77]">
                        Pair Address: <span className="font-mono break-all">{pairAddress}</span>
                    </p>
                    <p className="text-[#415A77]">Total Supply: {totalSupply}</p>
                    <p className="text-[#415A77]">Decimals: {pairDecimals}</p>
                </div>
            </div>
        </div>
    );
}