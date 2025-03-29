import React, { useState } from "react";
import { ethers, AbiCoder } from "ethers";
import PAIR_ABI from "./abis/PAIR_ABI.json";
import ERC20_ABI from "./abis/ERC20_ABI.json";
import { Card, CardContent } from "./components/Card";
import { Input } from "./components/Input";
import { Button } from "./components/Button";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import "./form.css";

const MULTICALL_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11";
const provider = new ethers.JsonRpcProvider("https://eth.llamarpc.com");
const abiCoder = AbiCoder.defaultAbiCoder();

const UniswapV2PairInfo = () => {
  const [pairAddress, setPairAddress] = useState(null);
  const [pairData, setPairData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPairData = async () => {
    if (!ethers.isAddress(pairAddress)) {
      alert("Invalid address");
      return;
    }

    setLoading(true);
    try {
      const multicall = new ethers.Contract(
        MULTICALL_ADDRESS,
        [
          "function aggregate(tuple(address target, bytes callData)[] calls) public view returns (uint256 blockNumber, bytes[] returnData)"
        ],
        provider
      );

      const pairContract = new ethers.Contract(pairAddress, PAIR_ABI, provider);
      const calls = [
        { target: pairAddress, callData: pairContract.interface.encodeFunctionData("token0") },
        { target: pairAddress, callData: pairContract.interface.encodeFunctionData("token1") },
        { target: pairAddress, callData: pairContract.interface.encodeFunctionData("getReserves") },
        { target: pairAddress, callData: pairContract.interface.encodeFunctionData("totalSupply") }
      ];

      const [, returnData] = await multicall.aggregate(calls);
      const token0Address = abiCoder.decode(["address"], returnData[0])[0];
      const token1Address = abiCoder.decode(["address"], returnData[1])[0];
      const reserves = abiCoder.decode(["uint112", "uint112", "uint32"], returnData[2]);
      const totalSupply = abiCoder.decode(["uint256"], returnData[3])[0];

      const token0Contract = new ethers.Contract(token0Address, ERC20_ABI, provider);
      const token1Contract = new ethers.Contract(token1Address, ERC20_ABI, provider);

      const token0Name = await token0Contract.name();
      const token1Name = await token1Contract.name();
      const token0Decimals = await token0Contract.decimals();
      const token1Decimals = await token1Contract.decimals();

      setPairData({
        token0: { address: token0Address, name: token0Name, decimals: token0Decimals },
        token1: { address: token1Address, name: token1Name, decimals: token1Decimals },
        reserves,
        totalSupply
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to fetch data");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6" id="app">
      <motion.h1 
        className="text-3xl font-bold text-center mb-6 text-blue-400"
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
      >
        Uniswap V2 Pair Data Retriever
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.3 }}
      >
        Enter a Uniswap V2 pair contract address below and submit
      </motion.p>
      
      <Card className="w-full max-w-lg bg-gray-800 border-gray-700 shadow-xl p-6 mt-4">
        <CardContent className="flex flex-col space-y-4" id="pair-form">
          <Input
            type="text"
            value={pairAddress}
            onChange={(e) => setPairAddress(e.target.value)}
            placeholder="Enter Pair Address"
            className="p-3 rounded-lg border-gray-600 focus:ring-2 focus:ring-blue-400 transition-all duration-300"
          />
          <Button
            onClick={fetchPairData}
            className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex justify-center items-center transition-all duration-300"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : "Fetch Data"}
          </Button>
        </CardContent>
      </Card>

      {pairData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="w-full max-w-lg bg-gray-800 border-gray-700 shadow-xl p-6 mt-6">
            <CardContent>
              <div id="pair-details">
                <h2 className="text-2xl font-semibold text-blue-400 mb-2">Pair Details</h2>
                <p className="mt-2">
                  <span className="text-gray-400">Token 0 :</span> {pairData.token0.address} / {pairData.token0.name} - {pairData.token0.decimals} decimals
                </p>
                <p>
                  <span className="text-gray-400">Token 1 :</span> {pairData.token1.address} / {pairData.token1.name} - {pairData.token1.decimals} decimals
                </p>
                <p className="mt-2">
                  <span className="text-gray-400">Reserves :</span> {pairData.reserves[0].toString()} / {pairData.reserves[1].toString()}
                </p>
                <p>
                  <span className="text-gray-400">Total Supply :</span> {pairData.totalSupply.toString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default UniswapV2PairInfo;
