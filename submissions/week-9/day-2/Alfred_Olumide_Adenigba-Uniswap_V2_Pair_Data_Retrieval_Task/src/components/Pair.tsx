import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import MULTICALL_ABI from "../abi/multicall2.json";
import PAIR_ABI from "../abi/uniswapv2pair.json";
import ERC20_ABI from "../abi/erc20.json";

const MULTICALL_ADDRESS = import.meta.env.VITE_MULTICALL_CONTRACT_ADDRESS; // Ethereum Mainnet Multicall2
const RPCProvider = import.meta.env.VITE_MAINNET_RPC;

interface TokenData {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

interface PairData {
  token0: TokenData;
  token1: TokenData;
  reserves: {
    token0: string;
    token1: string;
  };
  totalSupply: string;
}

interface PairProps {
  initialPairAddress?: string;
}

const Pair = ({ initialPairAddress = "" }: PairProps) => {
  const [pairAddress, setPairAddress] = useState(initialPairAddress);
  const [data, setData] = useState<PairData | null>(null);
  const [loading, setLoading] = useState(false);

  // Effect to update pairAddress when initialPairAddress prop changes
  useEffect(() => {
    if (initialPairAddress) {
      setPairAddress(initialPairAddress);
      // Automatically fetch data for the pair when it's selected
      fetchPairData(initialPairAddress);
    }
  }, [initialPairAddress]);

  const fetchPairData = async (addressToFetch = pairAddress) => {
    if (!ethers.isAddress(addressToFetch)) {
      toast.error("Invalid contract address");
      return;
    }

    setLoading(true);
    setData(null);
    try {
      const provider = new ethers.JsonRpcProvider(RPCProvider);
      // Load Pair Contract
      const pairContract = new ethers.Contract(addressToFetch, PAIR_ABI, provider);

      // Fetch token addresses
      const token0Address = await pairContract.token0();
      const token1Address = await pairContract.token1();

      // Load Token Contracts
      const token0Contract = new ethers.Contract(
        token0Address,
        ERC20_ABI,
        provider
      );
      const token1Contract = new ethers.Contract(
        token1Address,
        ERC20_ABI,
        provider
      );

      // Use Multicall for batch fetching
      const multicall = new ethers.Contract(
        MULTICALL_ADDRESS,
        MULTICALL_ABI,
        provider
      );

      const calls = [
        {
          target: addressToFetch,
          callData: pairContract.interface.encodeFunctionData("getReserves"),
        },
        {
          target: addressToFetch,
          callData: pairContract.interface.encodeFunctionData("totalSupply"),
        },
        {
          target: token0Address,
          callData: token0Contract.interface.encodeFunctionData("name"),
        },
        {
          target: token0Address,
          callData: token0Contract.interface.encodeFunctionData("symbol"),
        },
        {
          target: token0Address,
          callData: token0Contract.interface.encodeFunctionData("decimals"),
        },
        {
          target: token1Address,
          callData: token1Contract.interface.encodeFunctionData("name"),
        },
        {
          target: token1Address,
          callData: token1Contract.interface.encodeFunctionData("symbol"),
        },
        {
          target: token1Address,
          callData: token1Contract.interface.encodeFunctionData("decimals"),
        },
      ];

      const result = await multicall.aggregate.staticCall(calls);
      if (!result || !Array.isArray(result)) {
        toast.error("Invalid response from Multicall");
        return;
      }
      const [, returnData] = result;
      console.log("Multicall Result:", result);

      // Decode returned data
      const reservesResult = ethers.AbiCoder.defaultAbiCoder().decode(
        ["uint112", "uint112", "uint32"],
        returnData[0]
      );
      
      const reserve0 = reservesResult[0];
      const reserve1 = reservesResult[1];
      
      // Decode the rest of the data
      const totalSupply = ethers.AbiCoder.defaultAbiCoder().decode(
        ["uint256"], 
        returnData[1]
      )[0];
      
      const token0Name = ethers.AbiCoder.defaultAbiCoder().decode(
        ["string"], 
        returnData[2]
      )[0];
      
      const token0Symbol = ethers.AbiCoder.defaultAbiCoder().decode(
        ["string"], 
        returnData[3]
      )[0];
      
      const token0Decimals = ethers.AbiCoder.defaultAbiCoder().decode(
        ["uint8"], 
        returnData[4]
      )[0];
      
      const token1Name = ethers.AbiCoder.defaultAbiCoder().decode(
        ["string"], 
        returnData[5]
      )[0];
      
      const token1Symbol = ethers.AbiCoder.defaultAbiCoder().decode(
        ["string"], 
        returnData[6]
      )[0];
      
      const token1Decimals = ethers.AbiCoder.defaultAbiCoder().decode(
        ["uint8"], 
        returnData[7]
      )[0];

      setData({
        token0: {
          address: token0Address,
          name: token0Name,
          symbol: token0Symbol,
          decimals: token0Decimals,
        },
        token1: {
          address: token1Address,
          name: token1Name,
          symbol: token1Symbol,
          decimals: token1Decimals,
        },
        reserves: {
          token0: ethers.formatUnits(reserve0, token0Decimals),
          token1: ethers.formatUnits(reserve1, token1Decimals),
        },
        totalSupply: ethers.formatUnits(totalSupply, 18),
      });
    } catch (err) {
      toast.error("Failed to fetch data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-full mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl text-black font-bold mb-4">
        Uniswap V2 Pair Data
      </h2>
      <div className="flex">
        <input
          type="text"
          placeholder="Enter Uniswap V2 Pair Address"
          value={pairAddress}
          onChange={(e) => setPairAddress(e.target.value)}
          className="border border-blue-500 text-black p-2 flex-grow rounded-l"
        />
        <button
          onClick={() => fetchPairData()}
          className="bg-blue-500 text-white px-4 py-2 rounded-r"
          disabled={loading}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            "Fetch"
          )}
        </button>
      </div>

      {data && (
        <div className="mt-6">
          <div className=" bg-gray-400 p-4 rounded mb-4">
            <div className="text-xl font-bold mb-2">
              {data.token0.symbol} / {data.token1.symbol}
            </div>
            <div className="text-sm text-gray-500 break-all">
              {pairAddress}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4  bg-gray-400 p-4 rounded">
            <div>
              <h3 className="font-semibold">Token 0:</h3>
              <p>
                <strong>Name:</strong> {data.token0.name}
              </p>
              <p>
                <strong>Symbol:</strong> {data.token0.symbol}
              </p>
              <p className="break-all">
                <strong>Address:</strong> {data.token0.address}
              </p>
            </div>

            <div>
              <h3 className="font-semibold">Token 1:</h3>
              <p>
                <strong>Name:</strong> {data.token1.name}
              </p>
              <p>
                <strong>Symbol:</strong> {data.token1.symbol}
              </p>
              <p className="break-all">
                <strong>Address:</strong> {data.token1.address}
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-400 rounded">
            <h3 className="font-semibold mb-2">Pool Information:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p>
                  <strong>{data.token0.symbol} Reserve:</strong>{" "}
                  {parseFloat(data.reserves.token0).toLocaleString(undefined, {
                    maximumFractionDigits: 6,
                  })}
                </p>
                <p>
                  <strong>{data.token1.symbol} Reserve:</strong>{" "}
                  {parseFloat(data.reserves.token1).toLocaleString(undefined, {
                    maximumFractionDigits: 6,
                  })}
                </p>
              </div>
              <div>
                <p>
                  <strong>Total Supply:</strong>{" "}
                  {parseFloat(data.totalSupply).toLocaleString(undefined, {
                    maximumFractionDigits: 6,
                  })}{" "}
                  LP Tokens
                </p>
                <p>
                  <strong>Token Ratio:</strong>{" "}
                  {(
                    parseFloat(data.reserves.token0) /
                    parseFloat(data.reserves.token1)
                  ).toLocaleString(undefined, { maximumFractionDigits: 6 })}{" "}
                  {data.token0.symbol} per {data.token1.symbol}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pair;