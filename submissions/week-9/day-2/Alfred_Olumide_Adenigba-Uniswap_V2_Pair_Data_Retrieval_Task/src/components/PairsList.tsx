import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import MULTICALL_ABI from "../abi/multicall2.json";
import FACTORY_ABI from "../abi/uniswapv2factory.json";
import PAIR_ABI from "../abi/uniswapv2pair.json";
import ERC20_ABI from "../abi/erc20.json";

const MULTICALL_ADDRESS = import.meta.env.VITE_MULTICALL_CONTRACT_ADDRESS;
const FACTORY_ADDRESS = import.meta.env.VITE_FACTORY_CONTRACT_ADDRESS; // UniswapV2Factory address
const RPCProvider = import.meta.env.VITE_MAINNET_RPC;

interface PairInfo {
  address: string;
  token0: {
    address: string;
    symbol: string;
  };
  token1: {
    address: string;
    symbol: string;
  };
}

interface PairsListProps {
  onSelectPair?: (pairAddress: string) => void;
}

const PairsList = ({ onSelectPair }: PairsListProps) => {
  const [pairInfos, setPairInfos] = useState<PairInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(7);

  useEffect(() => {
    fetchPairs();
  }, []);

  const fetchPairs = async () => {
    setLoading(true);
    try {
      const provider = new ethers.JsonRpcProvider(RPCProvider);
      const factoryContract = new ethers.Contract(
        FACTORY_ADDRESS,
        FACTORY_ABI,
        provider
      );
      const multicall = new ethers.Contract(
        MULTICALL_ADDRESS,
        MULTICALL_ABI,
        provider
      );

      // Get the total number of pairs
      const allPairsLength = await factoryContract.allPairsLength();

      // Calculate the actual limit (min of limit state and allPairsLength)
      const actualLimit = Math.min(limit, Number(allPairsLength));

      // Prepare calls to get pair addresses
      const pairAddressesCallData = [];
      for (let i = 0; i < actualLimit; i++) {
        const call = {
          target: FACTORY_ADDRESS,
          callData: factoryContract.interface.encodeFunctionData("allPairs", [
            i,
          ]),
        };
        pairAddressesCallData.push(call);
      }

      // Execute multicall to get all pair addresses
      const pairAddressesResult = await multicall.aggregate.staticCall(
        pairAddressesCallData
      );
      const returnData = pairAddressesResult[1]; // returnData is the second item in the result array

      // Decode the pair addresses
      const pairAddresses = returnData.map(
        (data: ethers.BytesLike) =>
          ethers.AbiCoder.defaultAbiCoder().decode(["address"], data)[0]
      );

      // Fetch token info for each pair
      await fetchPairInfos(pairAddresses, provider, multicall);
    } catch (err) {
      console.error("Error fetching pairs:", err);
      toast.error("Failed to fetch pair addresses");
    } finally {
      setLoading(false);
    }
  };

  const fetchPairInfos = async (
    addresses: string[],
    provider: ethers.JsonRpcProvider,
    multicall: ethers.Contract
  ) => {
    try {
      // Prepare calls to get token0 and token1 for each pair
      const pairCalls = [];

      for (const pairAddress of addresses) {
        const pairContract = new ethers.Contract(
          pairAddress,
          PAIR_ABI,
          provider
        );

        // Get token0 address
        pairCalls.push({
          target: pairAddress,
          callData: pairContract.interface.encodeFunctionData("token0"),
        });

        // Get token1 address
        pairCalls.push({
          target: pairAddress,
          callData: pairContract.interface.encodeFunctionData("token1"),
        });
      }

      // Execute multicall
      const pairResult = await multicall.aggregate.staticCall(pairCalls);
      const pairReturnData = pairResult[1];

      // Process the return data
      const pairInfos: PairInfo[] = [];

      for (let i = 0; i < addresses.length; i++) {
        const pairAddress = addresses[i];
        const token0Address = ethers.AbiCoder.defaultAbiCoder().decode(
          ["address"],
          pairReturnData[i * 2]
        )[0];
        const token1Address = ethers.AbiCoder.defaultAbiCoder().decode(
          ["address"],
          pairReturnData[i * 2 + 1]
        )[0];

        // Fetch token symbols in separate multicall
        const symbolCalls = [
          {
            target: token0Address,
            callData: new ethers.Interface(ERC20_ABI).encodeFunctionData(
              "symbol"
            ),
          },
          {
            target: token1Address,
            callData: new ethers.Interface(ERC20_ABI).encodeFunctionData(
              "symbol"
            ),
          },
        ];

        const symbolResult = await multicall.aggregate.staticCall(symbolCalls);
        const symbolReturnData = symbolResult[1];

        const token0Symbol = ethers.AbiCoder.defaultAbiCoder().decode(
          ["string"],
          symbolReturnData[0]
        )[0];
        const token1Symbol = ethers.AbiCoder.defaultAbiCoder().decode(
          ["string"],
          symbolReturnData[1]
        )[0];

        pairInfos.push({
          address: pairAddress,
          token0: {
            address: token0Address,
            symbol: token0Symbol,
          },
          token1: {
            address: token1Address,
            symbol: token1Symbol,
          },
        });
      }

      setPairInfos(pairInfos);
    } catch (err) {
      console.error("Error fetching pair infos:", err);
      toast.error("Failed to fetch pair information");
    }
  };

  // Handle selecting a pair
  const handleSelectPair = (pairAddress: string) => {
    if (onSelectPair) {
      onSelectPair(pairAddress);
    }
  };

  return (
    <div className="max-w-full mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl text-black font-bold mb-4">
        Uniswap V2 Pairs List
      </h2>

      <div className="flex mb-4">
        <input
          type="number"
          min="1"
          max="100"
          value={limit}
          onChange={(e) => setLimit(parseInt(e.target.value))}
          className="border border-blue-500 text-black p-2 w-24 rounded mr-2"
        />
        <button
          onClick={fetchPairs}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Loading..." : "Fetch Pairs"}
        </button>
      </div>

      {loading && (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {pairInfos.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Pairs ({pairInfos.length})</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-center text-gray-700">
                    Pair Address
                  </th>
                  <th className="px-4 py-2 text-center text-gray-700">
                    Tokens
                  </th>
                  <th className="px-4 py-2 text-center text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pairInfos.map((pair, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2 text-blue-500 break-all">
                      <span className="text-sm font-mono font-bold">{pair.address}</span>
                    </td>
                    <td className="px-4 text-blue-600 font-medium items-center py-2">
                      {pair.token0.symbol} / {pair.token1.symbol}
                    </td>

                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleSelectPair(pair.address)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm mr-2"
                      >
                        Select
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(pair.address);
                          toast.success("Address copied to clipboard!");
                        }}
                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm"
                      >
                        Copy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PairsList;
