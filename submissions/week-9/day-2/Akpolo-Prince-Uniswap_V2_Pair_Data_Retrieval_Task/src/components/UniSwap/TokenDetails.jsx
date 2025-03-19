"use client"

import { formatAddress } from "../../utils/format"

const TokenDetails = ({
  token,
  tokenDetails,
  reserve,
  price,
  formatNumber,
  copyToClipboard,
  copied,
  colorClass,
  hoverColorClass,
  bgColorClass,
  copyType,
}) => {
  return (
    <div
      className={`bg-slate-800 bg-opacity-50 backdrop-blur-sm p-6 rounded-xl border border-slate-700 shadow-xl transition-all duration-300 ${hoverColorClass} transform hover:-translate-y-1`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className={`text-xl font-bold ${colorClass}`}>{tokenDetails.symbol}</h3>
        <div className="flex items-center">
          <div className="relative">
            <button
              onClick={() => copyToClipboard(token, copyType)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
            >
              <span>{formatAddress(token)}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
            {copied && (
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-slate-700 rounded text-xs animate-fadeIn">
                Copied!
              </span>
            )}
          </div>
          <a
            href={`https://etherscan.io/token/${token}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 p-1.5 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-400">Name</span>
          <span>{tokenDetails.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Decimals</span>
          <span>{tokenDetails.decimals}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Reserve</span>
          <span>{formatNumber(reserve, tokenDetails.decimals)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Price</span>
          <span>{price}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700">
        <a
          href={`https://app.uniswap.org/#/swap?inputCurrency=${token}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-center gap-2 w-full py-2 ${bgColorClass} rounded-lg transition-colors ${colorClass}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
          Trade on Uniswap
        </a>
      </div>
    </div>
  )
}

export default TokenDetails

