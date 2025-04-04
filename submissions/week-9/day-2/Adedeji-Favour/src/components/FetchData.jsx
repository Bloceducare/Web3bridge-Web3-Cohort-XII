import { useEffect, useState } from 'react'
import { Contract, formatEther, formatUnits, Interface, JsonRpcProvider } from "ethers";
import MULTICALL_ABI from "../abi/multicall.json"
import ERC20_ABI from "../abi/erc20_abi.json"
import UNISWAP_ABI from "../abi/uniswap_pair.json"


const FetchData = ({pairAddress}) => {
  const [totalSupply, setTotalSupply] = useState(0)
  const [token0, setToken0] = useState("0x..")
  const [token1, setToken1] = useState("0x..")
  const [token0Reserve, setToken0Reserve] = useState(0)
  const [token1Reserve, setToken1Reserve] = useState(0)
  const [token0Name, setToken0Name] = useState()
  const [token0Symbol, setToken0Symbol] = useState()
  const [token0Decimal, setToken0Decimal] = useState(0)
  const [token1Name, setToken1Name] = useState()
  const [token1Symbol, setToken1Symbol] = useState()
  const [token1Decimal, setToken1Decimal] = useState(0)

  const multicallContractAddress = import.meta.env.VITE_MULTICALL_CONTRACT

  useEffect(() => {
    makeMultipleCalls()
  })

  const makeMultipleCalls = async () => {
    try {
      const provider = new JsonRpcProvider(import.meta.env.VITE_ALCHEMY_MAINNET_RPC)
      
      const uniswapAbiInterface = new Interface(UNISWAP_ABI)
      const erc20AbiInterface = new Interface(ERC20_ABI)
      const multicallContract = new Contract(
        multicallContractAddress,
        MULTICALL_ABI,
        provider
    )

    const calls = [
      {target: pairAddress, callData: uniswapAbiInterface.encodeFunctionData("token0", [])},
      {target: pairAddress, callData: uniswapAbiInterface.encodeFunctionData("token1", [])},
      {target: pairAddress, callData: uniswapAbiInterface.encodeFunctionData("getReserves", [])},
      {target: pairAddress, callData: uniswapAbiInterface.encodeFunctionData("totalSupply", [])},
    ]
    
    const resultArray = await multicallContract.aggregate.staticCall(calls)

    const results = JSON.parse(JSON.stringify(resultArray[1]))
    
    const token0Result = uniswapAbiInterface.decodeFunctionResult("token0", results[0])
    const token1Result = uniswapAbiInterface.decodeFunctionResult("token1", results[1])
    const getReservesResult = uniswapAbiInterface.decodeFunctionResult("getReserves", results[2])
    const totalSupplyResult = uniswapAbiInterface.decodeFunctionResult("totalSupply", results[3])
    setToken0(token0Result[0]);
    setToken1(token1Result[0]);
    setTotalSupply(totalSupplyResult[0]);
    setToken0Reserve(formatEther(getReservesResult[0]))
    setToken1Reserve(formatUnits(getReservesResult[1], 6));

    const tokenDetailsCalls = [
      {target: token0, callData: erc20AbiInterface.encodeFunctionData("name", [])},
      {target: token0, callData: erc20AbiInterface.encodeFunctionData("symbol", [])},
      {target: token0, callData: erc20AbiInterface.encodeFunctionData("decimals", [])},
      {target: token1, callData: erc20AbiInterface.encodeFunctionData("name", [])},
      {target: token1, callData: erc20AbiInterface.encodeFunctionData("symbol", [])},
      {target: token1, callData: erc20AbiInterface.encodeFunctionData("decimals", [])},
    ]
    
    const res = await multicallContract.aggregate.staticCall(tokenDetailsCalls)
    const resArr = JSON.parse(JSON.stringify(res[1]));
    
    const token0NameResult = erc20AbiInterface.decodeFunctionResult("name", resArr[0])
    const token0SymbolResult = erc20AbiInterface.decodeFunctionResult("symbol", resArr[1])
    const token0DecimalsResult = erc20AbiInterface.decodeFunctionResult("decimals", resArr[2])
    const token1NameResult = erc20AbiInterface.decodeFunctionResult("name", resArr[3])
    const token1SymbolResult = erc20AbiInterface.decodeFunctionResult("symbol", resArr[4])
    const token1DecimalsResult = erc20AbiInterface.decodeFunctionResult("decimals", resArr[5])

    setToken0Name(token0NameResult[0])
    setToken0Symbol(token0SymbolResult[0])
    setToken0Decimal(Number(token0DecimalsResult[0]))
    setToken1Name(token1NameResult[0])
    setToken1Symbol(token1SymbolResult[0])
    setToken1Decimal(Number(token1DecimalsResult[0]))

    console.log(totalSupply)
    console.log(token0Reserve)
    console.log(token1Reserve)

    } catch (error) {
      console.log("error => ", error.message);
      
      console.error(error)
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4">
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
          <strong>Token0:</strong> {token0Name} ({token0Symbol})
        </button>
        <button className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
          <strong>Token1:</strong> {token1Name} ({token1Symbol})
        </button>
        <button className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
          {token0Name} has {token0Decimal} Decimals
        </button>
        <button className="bg-pink-600 hover:bg-purple-700 text-white py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
          {token1Name} has {token1Decimal} Decimals 
        </button>
        <button className="bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
          <strong>{token0Name} Reserves:</strong> {token0Reserve} {token0Symbol}
        </button>
        <button className="bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
          <strong>{token1Name} Reserves:</strong>  {token1Reserve} {token1Symbol}
        </button>
        <button className="bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
          <strong>Total LP Supply:</strong> {totalSupply}
        </button>
      </div>
    </div>
  )
}

export default FetchData
