import { Contract } from "ethers"
import { useState, useEffect } from "react"
import { MultiCallABI, UniswapV2ABI } from "../abis/ConstractAbi"
import { getReadOnlyProvider } from "../utils/provider"
import { multiCallAddress } from "../config/address"
import { Interface } from "ethers"



const useUniswapV2 = () => {


    const [tokenAddresses, setTokenAddresses] = useState([])
    const [reserves, setReserves] = useState([])
    const [totalSupply, setTotalSupply] = useState()
    const [tokenPairData, setTokenPairData] = useState([])
    
    const contractInterface = new Interface(UniswapV2ABI)

    const fetchUniswapData = async (tokenPairAddress) => {
        try {
            const contract = new Contract(
                multiCallAddress,
                MultiCallABI,
                getReadOnlyProvider()
            )


            const calls = [
                {
                    target: tokenPairAddress,
                    callData: contractInterface.encodeFunctionData("token0", [])
                },
                {
                    target: tokenPairAddress,
                    callData: contractInterface.encodeFunctionData("token1", [])
                },
                {
                    target: tokenPairAddress,
                    callData: contractInterface.encodeFunctionData("getReserves", [])
                },
                {
                    target: tokenPairAddress,
                    callData: contractInterface.encodeFunctionData("totalSupply", [])
                }
            ]
            

            const results = await contract.tryAggregate.staticCall(false, calls)

            const resultsParsed = JSON.parse(JSON.stringify(results))

            
            const decodedtoken0 = contractInterface.decodeFunctionResult("token0", resultsParsed[0][1])[0]
            const decodedtoken1 = contractInterface.decodeFunctionResult("token1", resultsParsed[1][1])[0]
            const decodedGetReserves = contractInterface.decodeFunctionResult("getReserves", resultsParsed[2][1])
            const decodedTotalSupply = contractInterface.decodeFunctionResult("totalSupply", resultsParsed[3][1])[0]

 

            const tokenCalls = [
                {
                    target: decodedtoken0,
                    callData: contractInterface.encodeFunctionData("name", [])
                },
                {
                    target: decodedtoken0,
                    callData: contractInterface.encodeFunctionData("decimals", [])
                },
                {
                    target: decodedtoken0,
                    callData: contractInterface.encodeFunctionData("symbol", [])
                },
                {
                    target: decodedtoken1,
                    callData: contractInterface.encodeFunctionData("name", [])
                },
                {
                    target: decodedtoken1,
                    callData: contractInterface.encodeFunctionData("decimals", [])
                },
                {
                    target: decodedtoken1,
                    callData: contractInterface.encodeFunctionData("symbol", [])
                },
                
            ]

            const tokenResults = await contract.tryAggregate.staticCall(false, tokenCalls)
            console.log("TokenResults: ", JSON.parse(JSON.stringify(tokenResults)))
            const decodedToken0Name = contractInterface.decodeFunctionResult("name", tokenResults[0][1])[0]
            const decodedToken0Decimals = contractInterface.decodeFunctionResult("decimals", tokenResults[1][1])[0]
            const decodedToken0Symbol = contractInterface.decodeFunctionResult("symbol", tokenResults[2][1])[0]

            const decodedToken1Name = contractInterface.decodeFunctionResult("name", tokenResults[3][1])[0]
            const decodedToken1Decimals = contractInterface.decodeFunctionResult("decimals", tokenResults[4][1])[0]
            const decodedToken1Symbol = contractInterface.decodeFunctionResult("symbol", tokenResults[5][1])[0]

            console.log("token1:", {decodedtoken1, decodedToken1Name, decodedToken1Decimals, decodedToken1Symbol})
        

            setTokenAddresses([decodedtoken0, decodedtoken1])
            setReserves(decodedGetReserves.slice(0,2).toArray())
            setTotalSupply(decodedTotalSupply)
            setTokenPairData([
                {
                    address: decodedtoken0,
                    name: decodedToken0Name,
                    decimals: decodedToken0Decimals,
                    symbol: decodedToken0Symbol
                },
                {
                    address: decodedtoken1,
                    name: decodedToken1Name,
                    decimals: decodedToken1Decimals,
                    symbol: decodedToken1Symbol
                }
            ])
        
            
        } catch (error) {
            console.error("Error fetching Uniswap data: ", error)
        }


            
    }

    // fetchUniswapData("0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc")


  

    return {tokenAddresses, reserves, totalSupply, tokenPairData, fetchUniswapData}

}

export default useUniswapV2;