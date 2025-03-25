"use client"

const OverviewTab = ({ token0Details, token1Details, reserve0, reserve1, totalSupply, formatNumber }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
      <div className="bg-slate-900 bg-opacity-50 rounded-lg p-4 border border-slate-800 transform transition-all duration-300 hover:scale-105">
        <h3 className="text-gray-400 text-sm mb-1">Total Supply</h3>
        <p className="text-lg font-medium">{formatNumber(totalSupply)} LP</p>
      </div>
      <div className="bg-slate-900 bg-opacity-50 rounded-lg p-4 border border-slate-800 transform transition-all duration-300 hover:scale-105">
        <h3 className="text-gray-400 text-sm mb-1">{token0Details.symbol} Reserve</h3>
        <p className="text-lg font-medium">{formatNumber(reserve0, token0Details.decimals)}</p>
      </div>
      <div className="bg-slate-900 bg-opacity-50 rounded-lg p-4 border border-slate-800 transform transition-all duration-300 hover:scale-105">
        <h3 className="text-gray-400 text-sm mb-1">{token1Details.symbol} Reserve</h3>
        <p className="text-lg font-medium">{formatNumber(reserve1, token1Details.decimals)}</p>
      </div>
    </div>
  )
}

export default OverviewTab

