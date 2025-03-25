"use client"

import { useState } from "react"
import { ethers } from "ethers"

const LPCalculatorTab = ({ token0Details, token1Details, reserve0, reserve1, totalSupply, prices }) => {
  const [lpAmount, setLpAmount] = useState("")

  const calculateLiquidityShare = (lpAmount) => {
    if (!totalSupply || !reserve0 || !reserve1 || !token0Details.decimals || !token1Details.decimals) {
      return { share0: "0", share1: "0", percentage: "0" }
    }

    try {
      const totalSupplyFormatted = ethers.formatEther(totalSupply)
      const percentage = (Number.parseFloat(lpAmount) / Number.parseFloat(totalSupplyFormatted)) * 100

      if (isNaN(percentage) || percentage <= 0) {
        return { share0: "0", share1: "0", percentage: "0" }
      }

      const share0 = Number.parseFloat(ethers.formatUnits(reserve0, token0Details.decimals)) * (percentage / 100)
      const share1 = Number.parseFloat(ethers.formatUnits(reserve1, token1Details.decimals)) * (percentage / 100)

      return {
        share0: share0.toLocaleString(undefined, { maximumFractionDigits: 6 }),
        share1: share1.toLocaleString(undefined, { maximumFractionDigits: 6 }),
        percentage: percentage.toFixed(2),
      }
    } catch (error) {
      console.error("Error calculating liquidity share:", error)
      return { share0: "0", share1: "0", percentage: "0" }
    }
  }

  return (
    <div className="animate-fadeIn">
      <div className="bg-slate-900 bg-opacity-50 rounded-lg p-6 border border-slate-800 mb-6">
        <h3 className="text-lg font-medium text-white mb-4">Liquidity Position Calculator</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Enter LP Token Amount</label>
            <div className="flex">
              <input
                type="number"
                value={lpAmount}
                onChange={(e) => setLpAmount(e.target.value)}
                placeholder="0.0"
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {lpAmount && Number.parseFloat(lpAmount) > 0 && (
            <div className="mt-4 space-y-4">
              <div className="bg-slate-800 p-4 rounded-lg">
                <h4 className="text-sm text-gray-400 mb-2">Your Position</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Share of Pool</p>
                    <p className="text-lg font-medium">{calculateLiquidityShare(lpAmount).percentage}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{token0Details.symbol}</p>
                    <p className="text-lg font-medium">{calculateLiquidityShare(lpAmount).share0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{token1Details.symbol}</p>
                    <p className="text-lg font-medium">{calculateLiquidityShare(lpAmount).share1}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 p-4 rounded-lg">
                <h4 className="text-sm text-gray-400 mb-2">Position Value</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">In {token0Details.symbol}</p>
                    <p className="text-lg font-medium">
                      {(
                        Number.parseFloat(calculateLiquidityShare(lpAmount).share0) +
                        Number.parseFloat(calculateLiquidityShare(lpAmount).share1) *
                          Number.parseFloat(prices.token1Price)
                      ).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">In {token1Details.symbol}</p>
                    <p className="text-lg font-medium">
                      {(
                        Number.parseFloat(calculateLiquidityShare(lpAmount).share1) +
                        Number.parseFloat(calculateLiquidityShare(lpAmount).share0) *
                          Number.parseFloat(prices.token0Price)
                      ).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-400 mt-2">
            Enter the amount of LP tokens you own to calculate your share of the pool and the value of your position.
          </div>
        </div>
      </div>
    </div>
  )
}

export default LPCalculatorTab

