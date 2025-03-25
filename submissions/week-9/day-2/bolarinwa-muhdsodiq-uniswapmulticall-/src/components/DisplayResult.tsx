import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers';
import Abi from "../contract/Abi.json"
import { erc20ABI, getPairAddress } from '../helpers/index';
import Multicall2 from "../contract/Mutilcall.json"
import { Interface } from 'ethers';


interface TokenDetails {

  tokenAddress0: string,
  tokenAddress1: string

  totalSupply: number,
  reserve0: string,
  reserve1: string
}

interface TokenData {
  token0Name: string,
  token0Symbol: string,
  token0Decimals: number,
  token1Name: string,
  token1Symbol: string,
  token1Decimals: number,
}
const DisplayResult = () => {
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null)
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [pairAddress, setPairAddress] = useState('')
  const [loading, setLoading] = useState(false)
  
  




  const provider = new ethers.InfuraProvider('mainnet', import.meta.env.VITE_INFURA_PROVIDER)

  // 0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441 v1
  // 0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696 v2

  const UNISWAPINTERFACE = new Interface(Abi.abi);
  const ERC20INTERFACE = new Interface(erc20ABI);


  // const tokenA = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC
  // const tokenB = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'; // WETH
  // const pairAddress = getPairAddress(tokenA, tokenB);
  // console.log(pairAddress);
  

  const fecthPair = async () => {
    setLoading(true);
    try {

      const multiCallContract = new ethers.Contract(import.meta.env.VITE_MULTICALL_CONTRACT_ADDRESS,
        Multicall2, provider
      )

      const call = [
        {
          target: pairAddress,
          callData: UNISWAPINTERFACE.encodeFunctionData("token0", [])
        },
        {
          target: pairAddress,
          callData: UNISWAPINTERFACE.encodeFunctionData("token1", [])
        },
        {
          target: pairAddress,
          callData: UNISWAPINTERFACE.encodeFunctionData("getReserves", [])
        },
        {
          target: pairAddress,
          callData: UNISWAPINTERFACE.encodeFunctionData("totalSupply", [])
        }
      ]

      const [, results] = await multiCallContract.aggregate.staticCall(call);
      console.log("results", results[2])
      const resultsArray = JSON.parse(JSON.stringify(results))
      console.log("result array", resultsArray)

      const tokenAddress0 = UNISWAPINTERFACE.decodeFunctionResult('token0', results[0])[0]
      const tokenAddress1 = UNISWAPINTERFACE.decodeFunctionResult('token1', results[1])[0]
      const reserved = UNISWAPINTERFACE.decodeFunctionResult('getReserves', results[2])
      const totalSupplyCall = UNISWAPINTERFACE.decodeFunctionResult('totalSupply', results[3])[0]

      const tokenCall = [
        {
          target: tokenAddress0,
          callData: ERC20INTERFACE.encodeFunctionData("name", [])
        },
        {
          target: tokenAddress0,
          callData: ERC20INTERFACE.encodeFunctionData("symbol", [])
        },
        {
          target: tokenAddress0,
          callData: ERC20INTERFACE.encodeFunctionData("decimals", [])
        },
        {
          target: tokenAddress1,
          callData: ERC20INTERFACE.encodeFunctionData("name", [])
        },
        {
          target: tokenAddress1,
          callData: ERC20INTERFACE.encodeFunctionData("symbol", [])
        },
        {
          target: tokenAddress1,
          callData: ERC20INTERFACE.encodeFunctionData("decimals", [])
        },
      ]

      const [, tokenCallResult] = await multiCallContract.aggregate.staticCall(tokenCall);
      // console.log("token call result",tokenCallResult)

      const token0Name = ERC20INTERFACE.decodeFunctionResult('name', tokenCallResult[0])[0]
      const token0Symbol = ERC20INTERFACE.decodeFunctionResult('symbol', tokenCallResult[1])[0]
      const token0Decimals = ERC20INTERFACE.decodeFunctionResult('decimals', tokenCallResult[2])[0]
      const token1Name = ERC20INTERFACE.decodeFunctionResult('name', tokenCallResult[3])[0]
      const token1Symbol = ERC20INTERFACE.decodeFunctionResult('symbol', tokenCallResult[4])[0]
      const token1Decimals = ERC20INTERFACE.decodeFunctionResult('decimals', tokenCallResult[5])[0]
      console.log("token0", token0Name, token0Symbol, token0Decimals);
      console.log("token1", token1Name, token1Symbol, token1Decimals);
      setTokenData({
        token0Name: token0Name,
        token0Symbol: token0Symbol,
        token0Decimals: token0Decimals,
        token1Name: token1Name,
        token1Symbol: token1Symbol,
        token1Decimals: token1Decimals
      })




      console.log("call data result", tokenAddress0, tokenAddress1);
      setTokenDetails({
        tokenAddress0: tokenAddress0,
        tokenAddress1: tokenAddress1,
        totalSupply: totalSupplyCall.toString(),
        reserve0: reserved[0].toString(),
        reserve1: reserved[1].toString(),
        // blockTimestampLast: reserved[2]
      })
      
      console.log("reserves", {
        reserve0: reserved[0].toString(),
        reserve1: reserved[1].toString(),
        blockTimestampLast: reserved[2]
      });

      console.log("totalSupply", totalSupplyCall.toString());


      // setLoading(false)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }

  };
  // useEffect(() => {
  //   fecthPair();

  // }, [])
  return (
    <div>
      <p>Peer example to use 0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc. wrapped eth and USDC</p>
      <input type="text" placeholder='pair address' onChange={(e) => setPairAddress(e.target.value)} className='input' />
      <button onClick={fecthPair}>Fetch Token Pair</button>
      <div>
        
        
      </div>
      {
        !loading ? <>
          <p>Input token pair or copy the example to get details</p>
        </> : <>
        <div>
        <p>First Token Details</p>
        <p>Token address 1 {tokenDetails?.tokenAddress0}</p>
        <p>Name {tokenData?.token0Name}, Symbol {tokenData?.token0Symbol}, Decimal {tokenData?.token0Decimals}</p>
        <p>{tokenDetails?.reserve1}</p>

      </div>
      <div>
        <p>Token 2 Details</p>
        <p>Token Address 2 {tokenDetails?.tokenAddress1}</p>
        <p>Name: {tokenData?.token1Name}, Symbol: {tokenData?.token1Symbol}, Decimal: {tokenData?.token1Decimals}</p>
        <p>{tokenDetails?.reserve1}</p>
      </div>
        </>
      }
      
    </div>
  )
}

export default DisplayResult
