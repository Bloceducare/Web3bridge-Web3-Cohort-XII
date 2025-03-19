import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getReadOnlyProvider } from "../utils/provider";
import MULTICALL_ABI from "../ABI/multicall2.json";
import UNISWAP_V2_PAIR_ABI from "../ABI/UniswapV2.json";
import ERC20_ABI from "../ABI/ERC20.json";
import { Interface } from "ethers/lib/utils";

function UniswapPairData({ pairAddress }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPairData = async () => {
      if (!pairAddress) {
        console.error("No pair address provided");
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const provider = getReadOnlyProvider();
        const multicallAddress = import.meta.env
          .VITE_MULTICALL_CONTRACT_ADDRESS;
        if (!multicallAddress)
          throw new Error("Multicall contract address not found");

        const multicall = new ethers.Contract(
          multicallAddress,
          MULTICALL_ABI,
          provider
        );
        const pairInterface = new Interface(UNISWAP_V2_PAIR_ABI);
        const erc20Interface = new Interface(ERC20_ABI);

        const calls = [
          {
            target: pairAddress,
            callData: pairInterface.encodeFunctionData("token0"),
          },
          {
            target: pairAddress,
            callData: pairInterface.encodeFunctionData("token1"),
          },
          {
            target: pairAddress,
            callData: pairInterface.encodeFunctionData("getReserves"),
          },
          {
            target: pairAddress,
            callData: pairInterface.encodeFunctionData("totalSupply"),
          },
        ];

        const results = await multicall.callStatic.aggregate(calls);
        if (!results) throw new Error("Failed to fetch data from Multicall");

        const token0 = pairInterface.decodeFunctionResult(
          "token0",
          results.returnData[0]
        )[0];
        const token1 = pairInterface.decodeFunctionResult(
          "token1",
          results.returnData[1]
        )[0];
        const [reserve0, reserve1, timestamp] =
          pairInterface.decodeFunctionResult(
            "getReserves",
            results.returnData[2]
          );
        const totalSupply = pairInterface.decodeFunctionResult(
          "totalSupply",
          results.returnData[3]
        )[0];

        const tokenCalls = [
          {
            target: token0,
            callData: erc20Interface.encodeFunctionData("name"),
          },
          {
            target: token0,
            callData: erc20Interface.encodeFunctionData("symbol"),
          },
          {
            target: token0,
            callData: erc20Interface.encodeFunctionData("decimals"),
          },
          {
            target: token1,
            callData: erc20Interface.encodeFunctionData("name"),
          },
          {
            target: token1,
            callData: erc20Interface.encodeFunctionData("symbol"),
          },
          {
            target: token1,
            callData: erc20Interface.encodeFunctionData("decimals"),
          },
        ];

        const tokenResults = await multicall.callStatic.aggregate(tokenCalls);
        const token0Details = {
          name: erc20Interface.decodeFunctionResult(
            "name",
            tokenResults.returnData[0]
          )[0],
          symbol: erc20Interface.decodeFunctionResult(
            "symbol",
            tokenResults.returnData[1]
          )[0],
          decimals: Number(
            erc20Interface.decodeFunctionResult(
              "decimals",
              tokenResults.returnData[2]
            )[0]
          ),
        };
        const token1Details = {
          name: erc20Interface.decodeFunctionResult(
            "name",
            tokenResults.returnData[3]
          )[0],
          symbol: erc20Interface.decodeFunctionResult(
            "symbol",
            tokenResults.returnData[4]
          )[0],
          decimals: Number(
            erc20Interface.decodeFunctionResult(
              "decimals",
              tokenResults.returnData[5]
            )[0]
          ),
        };

        setData({
          token0,
          token1,
          reserve0,
          reserve1,
          timestamp,
          totalSupply,
          token0Details,
          token1Details,
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPairData();
  }, [pairAddress]);

  if (loading) return <p className="text-blue-400 text-center">Loading...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!data) return null;

  return (
    <div className="bg-gray-800 p-6  rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-blue-400">Uniswap Pair Data</h2>
      <div className="mt-4 space-y-2">
        <p>
          <strong className="text-blue-300">Token 0:</strong>{" "}
          {data.token0Details.name} ({data.token0Details.symbol})
        </p>
        <p>
          <strong className="text-blue-300">Token 1:</strong>{" "}
          {data.token1Details.name} ({data.token1Details.symbol})
        </p>
        <p>
          <strong className="text-blue-300">Reserves:</strong>{" "}
          {data.reserve0.toString()} / {data.reserve1.toString()}
        </p>
        <p>
          <strong className="text-blue-300">Total Supply:</strong>{" "}
          {ethers.utils.formatUnits(data.totalSupply, 18)}
        </p>
        <p>
          <strong className="text-blue-300">Last Updated:</strong>{" "}
          {new Date(data.timestamp * 1000).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export default UniswapPairData;
