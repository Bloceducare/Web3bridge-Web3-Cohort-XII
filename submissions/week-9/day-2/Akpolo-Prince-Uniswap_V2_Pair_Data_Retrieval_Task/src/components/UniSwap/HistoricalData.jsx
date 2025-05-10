"use client"

const HistoricalData = ({ pairAddress }) => {
  return (
    <div className="mt-6">
      <h3 className="text-gray-400 text-sm mb-2">Historical Data</h3>
      <div className="bg-slate-900 bg-opacity-50 rounded-lg p-4 border border-slate-800">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 mx-auto text-gray-500 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-gray-400">Historical data is available via the Uniswap subgraph</p>
            <a
              href={`https://info.uniswap.org/#/pools/${pairAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 px-3 py-1 bg-slate-800 rounded-lg text-pink-400 text-sm hover:bg-slate-700 transition-colors"
            >
              View on Uniswap Info
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HistoricalData

