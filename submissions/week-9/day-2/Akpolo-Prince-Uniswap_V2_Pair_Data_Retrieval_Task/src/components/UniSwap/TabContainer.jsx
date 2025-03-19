"use client"

import { useState } from "react"
import OverviewTab from "./tabs/OverviewTab"
import ReservesTab from "./tabs/ReservesTab"
import SwapCalculatorTab from "./tabs/SwapCalculatorTab"
import LPCalculatorTab from "./tabs/LpCalculatorTab"
import PriceInfo from "./PriceInfo"
import HistoricalData from "./HistoricalData"

const TabsContainer = ({
  token0,
  token1,
  token0Details,
  token1Details,
  reserve0,
  reserve1,
  totalSupply,
  formatNumber,
  prices,
}) => {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <>
      {/* Tabs */}
      <div className="mb-6 border-b border-slate-700">
        <div className="flex space-x-6 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-2 px-1 transition-all whitespace-nowrap ${
              activeTab === "overview"
                ? "text-pink-400 border-b-2 border-pink-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("reserves")}
            className={`pb-2 px-1 transition-all whitespace-nowrap ${
              activeTab === "reserves"
                ? "text-pink-400 border-b-2 border-pink-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Reserves
          </button>
          <button
            onClick={() => setActiveTab("swap")}
            className={`pb-2 px-1 transition-all whitespace-nowrap ${
              activeTab === "swap" ? "text-pink-400 border-b-2 border-pink-400" : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Swap Calculator
          </button>
          <button
            onClick={() => setActiveTab("calculator")}
            className={`pb-2 px-1 transition-all whitespace-nowrap ${
              activeTab === "calculator"
                ? "text-pink-400 border-b-2 border-pink-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            LP Calculator
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <OverviewTab
          token0Details={token0Details}
          token1Details={token1Details}
          reserve0={reserve0}
          reserve1={reserve1}
          totalSupply={totalSupply}
          formatNumber={formatNumber}
        />
      )}

      {activeTab === "reserves" && (
        <ReservesTab
          token0Details={token0Details}
          token1Details={token1Details}
          reserve0={reserve0}
          reserve1={reserve1}
          formatNumber={formatNumber}
          prices={prices}
        />
      )}

      {activeTab === "swap" && (
        <SwapCalculatorTab
          token0={token0}
          token1={token1}
          token0Details={token0Details}
          token1Details={token1Details}
          reserve0={reserve0}
          reserve1={reserve1}
          prices={prices}
        />
      )}

      {activeTab === "calculator" && (
        <LPCalculatorTab
          token0Details={token0Details}
          token1Details={token1Details}
          reserve0={reserve0}
          reserve1={reserve1}
          totalSupply={totalSupply}
          prices={prices}
        />
      )}

      <PriceInfo token0Details={token0Details} token1Details={token1Details} prices={prices} />

      <HistoricalData pairAddress={token0 && token1 ? `${token0}_${token1}` : ""} />
    </>
  )
}

export default TabsContainer

