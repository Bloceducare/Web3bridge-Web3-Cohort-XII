"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"

const SwapCalculatorTab = ({ token0, token1, token0Details, token1Details, reserve0, reserve1, prices }) => {
  const [swapAmount, setSwapAmount] = useState("1")
  const [swapDirection, setSwapDirection] = useState("0to1")
  const [expectedOutput, setExpectedOutput] = useState("")
  const [priceImpact, setPriceImpact] = useState("")

  useEffect(() => {
    if (reserve0 && reserve1 && token0Details.decimals && token1Details.decimals) {
      calculateSwapOutput()
    }
  }, [swapAmount, swapDirection, reserve0, reserve1, token0Details.decimals, token1Details.decimals])

  const calculateSwapOutput = () => {
    try {
      if (!swapAmount || isNaN(Number.parseFloat(swapAmount)) || Number.parseFloat(swapAmount) <= 0) {
        setExpectedOutput("")
        setPriceImpact("")
        return
      }

      const reserve0BN = ethers.getBigInt(reserve0)
      const reserve1BN = ethers.getBigInt(reserve1)

      let inputAmount
      let inputReserve
      let outputReserve
      let inputDecimals
      let outputDecimals

      if (swapDirection === "0to1") {
        inputAmount = ethers.parseUnits(swapAmount, token0Details.decimals)
        inputReserve = reserve0BN
        outputReserve = reserve1BN
        inputDecimals = token0Details.decimals
        outputDecimals = token1Details.decimals
      } else {
        inputAmount = ethers.parseUnits(swapAmount, token1Details.decimals)
        inputReserve = reserve1BN
        outputReserve = reserve0BN
        inputDecimals = token1Details.decimals
        outputDecimals = token0Details.decimals
      }

      // Calculate output amount using Uniswap formula
      // outputAmount = (inputAmount * 997 * outputReserve) / (inputReserve * 1000 + inputAmount * 997)
      const inputAmountWithFee = inputAmount * 997n
      const numerator = inputAmountWithFee * outputReserve
      const denominator = inputReserve * 1000n + inputAmountWithFee
      const outputAmount = numerator / denominator

      // Calculate price impact
      const spotPrice = (outputReserve * 1000n) / (inputReserve * 997n)
      const executionPrice = (outputAmount * 1000n) / (inputAmount * 997n)
      const impact = (1 - Number((executionPrice * 10000n) / spotPrice) / 10000) * 100

      setExpectedOutput(ethers.formatUnits(outputAmount, outputDecimals))
      setPriceImpact(impact.toFixed(2))
    } catch (error) {
      console.error("Error calculating swap output:", error)
      setExpectedOutput("Error")
      setPriceImpact("")
    }
  }

  return (
    <div className="animate-fadeIn">
      <div className="bg-slate-900 bg-opacity-50 rounded-lg p-6 border border-slate-800 mb-6">
        <h3 className="text-lg font-medium text-white mb-4">Swap Calculator</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Input Amount</label>
            <div className="flex">
              <input
                type="number"
                value={swapAmount}
                onChange={(e) => setSwapAmount(e.target.value)}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                placeholder="0.0"
                min="0"
                step="0.000001"
              />
              <button
                className="px-4 py-2 bg-slate-700 border border-slate-700 rounded-r-lg text-white font-medium"
                onClick={() => setSwapDirection(swapDirection === "0to1" ? "1to0" : "0to1")}
              >
                {swapDirection === "0to1" ? token0Details.symbol : token1Details.symbol}
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => setSwapDirection(swapDirection === "0to1" ? "1to0" : "0to1")}
              className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-all text-pink-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
            </button>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Expected Output</label>
            <div className="flex">
              <input
                type="text"
                value={expectedOutput}
                readOnly
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-l-lg text-white"
                placeholder="0.0"
              />
              <div className="px-4 py-2 bg-slate-700 border border-slate-700 rounded-r-lg text-white font-medium">
                {swapDirection === "0to1" ? token1Details.symbol : token0Details.symbol}
              </div>
            </div>
          </div>

          {priceImpact && (
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Price Impact</span>
                <span
                  className={`font-medium ${
                    Number.parseFloat(priceImpact) < 1
                      ? "text-green-400"
                      : Number.parseFloat(priceImpact) < 5
                        ? "text-yellow-400"
                        : "text-red-400"
                  }`}
                >
                  {priceImpact}%
                </span>
              </div>
              <div className="mt-2">
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      Number.parseFloat(priceImpact) < 1
                        ? "bg-green-400"
                        : Number.parseFloat(priceImpact) < 5
                          ? "bg-yellow-400"
                          : "bg-red-400"
                    }`}
                    style={{ width: `${Math.min(Number.parseFloat(priceImpact) * 10, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-800 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Exchange Rate</span>
              <span className="font-medium">
                1 {swapDirection === "0to1" ? token0Details.symbol : token1Details.symbol} ={" "}
                {swapDirection === "0to1" ? prices.token0Price : prices.token1Price}{" "}
                {swapDirection === "0to1" ? token1Details.symbol : token0Details.symbol}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <a
              href={`https://app.uniswap.org/#/swap?inputCurrency=${
                swapDirection === "0to1" ? token0 : token1
              }&outputCurrency=${swapDirection === "0to1" ? token1 : token0}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-lg text-white font-medium hover:opacity-90 transition-all text-center"
            >
              Trade on Uniswap
            </a>
            <p className="text-xs text-gray-400 text-center mt-2">
              This is a simulation. Click above to perform actual swaps on Uniswap.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SwapCalculatorTab

