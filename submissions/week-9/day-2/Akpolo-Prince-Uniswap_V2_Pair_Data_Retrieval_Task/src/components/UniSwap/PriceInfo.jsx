"use client"

const PriceInfo = ({ token0Details, token1Details, prices }) => {
  return (
    <div className="mt-6 bg-slate-900 bg-opacity-50 rounded-lg p-4 border border-slate-800">
      <h3 className="text-gray-400 text-sm mb-2">Price Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex justify-between items-center">
          <span>1 {token0Details.symbol} =</span>
          <span className="font-medium text-pink-400">
            {prices.token0Price} {token1Details.symbol}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>1 {token1Details.symbol} =</span>
          <span className="font-medium text-indigo-400">
            {prices.token1Price} {token0Details.symbol}
          </span>
        </div>
      </div>
    </div>
  )
}

export default PriceInfo

