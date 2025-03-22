import { Contract, Interface } from "ethers"
import MULTICALL_ABI from "../abi/multicall2.json"
import UNISWAP_V2_PAIR_ABI from "../abi/uniswapV2Pair.json"
import UNISWAP_V2_FACTORY_ABI from "../abi/uniswapV2Factory.json"
import ERC20_ABI from "../abi/erc20.json"
import { getReadOnlyProvider } from "./provider"

const UNISWAP_V2_FACTORY_ADDRESS = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"

export const getPairAddress = async (tokenA, tokenB) => {
  try {
    const provider = getReadOnlyProvider()
    const factory = new Contract(UNISWAP_V2_FACTORY_ADDRESS, UNISWAP_V2_FACTORY_ABI, provider)

    const [token0, token1] = tokenA.toLowerCase() < tokenB.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA]

    const pairAddress = await factory.getPair(token0, token1)

    if (pairAddress === "0x0000000000000000000000000000000000000000") {
      throw new Error("No Uniswap V2 pair exists for these tokens")
    }

    return pairAddress
  } catch (error) {
    console.error("Error getting pair address:", error)
    throw error
  }
}

export const isUniswapV2Pair = async (pairAddress) => {
  try {
    const provider = getReadOnlyProvider()
    const pair = new Contract(pairAddress, UNISWAP_V2_PAIR_ABI, provider)

    const factory = await pair.factory()

    return factory.toLowerCase() === UNISWAP_V2_FACTORY_ADDRESS.toLowerCase()
  } catch (error) {
    console.error("Error checking if address is a Uniswap V2 pair:", error)
    return false
  }
}

export const fetchSingleTokenData = async (tokenAddress) => {
  try {
    if (!tokenAddress || !tokenAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new Error("Invalid token address")
    }

    const provider = getReadOnlyProvider()
    const multicallAddress = import.meta.env.VITE_MULTICALL_ADDRESS || "0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696"

    const erc20Interface = new Interface(ERC20_ABI)

    const multicall = new Contract(multicallAddress, MULTICALL_ABI, provider)

    const tokenCalls = [
      {
        target: tokenAddress,
        callData: erc20Interface.encodeFunctionData("name", []),
      },
      {
        target: tokenAddress,
        callData: erc20Interface.encodeFunctionData("symbol", []),
      },
      {
        target: tokenAddress,
        callData: erc20Interface.encodeFunctionData("decimals", []),
      },
      {
        target: tokenAddress,
        callData: erc20Interface.encodeFunctionData("totalSupply", []),
      },
    ]

    const tokenResults = await multicall.aggregate.staticCall(tokenCalls)
    const tokenResultsData = tokenResults[1]

    const name = erc20Interface.decodeFunctionResult("name", tokenResultsData[0])[0]
    const symbol = erc20Interface.decodeFunctionResult("symbol", tokenResultsData[1])[0]
    const decimals = erc20Interface.decodeFunctionResult("decimals", tokenResultsData[2])[0]
    const totalSupply = erc20Interface.decodeFunctionResult("totalSupply", tokenResultsData[3])[0]

    const balanceCalls = [
      {
        target: tokenAddress,
        callData: erc20Interface.encodeFunctionData("balanceOf", ["0x28C6c06298d514Db089934071355E5743bf21d60"]),
      },
      {
        target: tokenAddress,
        callData: erc20Interface.encodeFunctionData("balanceOf", ["0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"]),
      },
    ]

    const balanceResults = await multicall.aggregate.staticCall(balanceCalls)
    const balanceResultsData = balanceResults[1]

    const binanceBalance = erc20Interface.decodeFunctionResult("balanceOf", balanceResultsData[0])[0]
    const uniswapBalance = erc20Interface.decodeFunctionResult("balanceOf", balanceResultsData[1])[0]

    return {
      address: tokenAddress,
      name,
      symbol,
      decimals,
      totalSupply: totalSupply.toString(),
      balances: {
        binance: binanceBalance.toString(),
        uniswap: uniswapBalance.toString(),
      },
    }
  } catch (error) {
    console.error("Error fetching token data:", error)
    throw error
  }
}

export const fetchTokenData = async (tokenAddress) => {
  try {
    const provider = getReadOnlyProvider()
    const multicallAddress = import.meta.env.VITE_MULTICALL_ADDRESS || "0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696"

    const erc20Interface = new Interface(ERC20_ABI)

    const multicall = new Contract(multicallAddress, MULTICALL_ABI, provider)

    const tokenCalls = [
      {
        target: tokenAddress,
        callData: erc20Interface.encodeFunctionData("name", []),
      },
      {
        target: tokenAddress,
        callData: erc20Interface.encodeFunctionData("symbol", []),
      },
      {
        target: tokenAddress,
        callData: erc20Interface.encodeFunctionData("decimals", []),
      },
    ]

    const tokenResults = await multicall.aggregate.staticCall(tokenCalls)
    const tokenResultsData = tokenResults[1]

    const name = erc20Interface.decodeFunctionResult("name", tokenResultsData[0])[0]
    const symbol = erc20Interface.decodeFunctionResult("symbol", tokenResultsData[1])[0]
    const decimals = erc20Interface.decodeFunctionResult("decimals", tokenResultsData[2])[0]

    return {
      address: tokenAddress,
      name,
      symbol,
      decimals,
    }
  } catch (error) {
    console.error("Error fetching token data:", error)
    throw error
  }
}

export const fetchPairDataDirect = async (pairAddress) => {
  try {
    if (!pairAddress || !pairAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new Error("Invalid pair address")
    }

    const isValidPair = await isUniswapV2Pair(pairAddress)
    if (!isValidPair) {
      throw new Error("The provided address is not a valid Uniswap V2 pair")
    }

    const provider = getReadOnlyProvider()
    const multicallAddress = import.meta.env.VITE_MULTICALL_ADDRESS || "0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696"

    const pairInterface = new Interface(UNISWAP_V2_PAIR_ABI)

    const multicall = new Contract(multicallAddress, MULTICALL_ABI, provider)

    const pairCalls = [
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
    ]

    const pairResults = await multicall.aggregate.staticCall(pairCalls)
    const pairResultsData = pairResults[1]

    const token0Address = pairInterface.decodeFunctionResult("token0", pairResultsData[0])[0]
    const token1Address = pairInterface.decodeFunctionResult("token1", pairResultsData[1])[0]
    const reserves = pairInterface.decodeFunctionResult("getReserves", pairResultsData[2])
    const totalSupply = pairInterface.decodeFunctionResult("totalSupply", pairResultsData[3])[0]

    const token0Data = await fetchTokenData(token0Address)
    const token1Data = await fetchTokenData(token1Address)

    return {
      pairAddress,
      token0: token0Data,
      token1: token1Data,
      reserves: {
        reserve0: reserves._reserve0.toString(),
        reserve1: reserves._reserve1.toString(),
        blockTimestampLast: reserves._blockTimestampLast,
      },
      totalSupply: totalSupply.toString(),
    }
  } catch (error) {
    console.error("Error fetching pair data:", error)
    throw error
  }
}

export const fetchPairData = async (pairAddress) => {
  try {
    const provider = getReadOnlyProvider()
    const multicallAddress = import.meta.env.VITE_MULTICALL_ADDRESS || "0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696"

    const pairInterface = new Interface(UNISWAP_V2_PAIR_ABI)

    const multicall = new Contract(multicallAddress, MULTICALL_ABI, provider)

    const pairCalls = [
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
    ]

    const pairResults = await multicall.aggregate.staticCall(pairCalls)
    const pairResultsData = pairResults[1]

    const token0Address = pairInterface.decodeFunctionResult("token0", pairResultsData[0])[0]
    const token1Address = pairInterface.decodeFunctionResult("token1", pairResultsData[1])[0]
    const reserves = pairInterface.decodeFunctionResult("getReserves", pairResultsData[2])
    const totalSupply = pairInterface.decodeFunctionResult("totalSupply", pairResultsData[3])[0]

    const token0Data = await fetchTokenData(token0Address)
    const token1Data = await fetchTokenData(token1Address)

    return {
      pairAddress,
      token0: token0Data,
      token1: token1Data,
      reserves: {
        reserve0: reserves._reserve0.toString(),
        reserve1: reserves._reserve1.toString(),
        blockTimestampLast: reserves._blockTimestampLast,
      },
      totalSupply: totalSupply.toString(),
    }
  } catch (error) {
    console.error("Error fetching pair data:", error)
    throw error
  }
}

export const formatTokenAmount = (amount, decimals) => {
  try {
    const amountStr = amount.toString()
    return (Number(amountStr) / Math.pow(10, Number(decimals))).toLocaleString(undefined, {
      maximumFractionDigits: 6,
    })
  } catch (error) {
    console.error("Error formatting token amount:", error)
    return "Error"
  }
}
