"use client"

import { formatAddress } from "../../utils/format"

const PairOverview = ({
  pairAddress,
  token0Details,
  token1Details,
  isFavorite,
  toggleFavorite,
  shareLink,
  shareToClipboard,
  showShareTooltip,
  copyToClipboard,
  copied,
  children,
}) => {
  return (
    <div className="bg-slate-800 bg-opacity-50 backdrop-blur-sm p-6 rounded-xl border border-slate-700 shadow-xl transition-all duration-300 hover:shadow-purple-500/10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">
          {token0Details.symbol}/{token1Details.symbol} Pair
        </h2>
        <div className="flex items-center mt-2 md:mt-0">
          <button
            onClick={toggleFavorite}
            className={`mr-2 p-1.5 rounded-lg transition-colors ${
              isFavorite() ? "bg-pink-500 bg-opacity-20 text-pink-400" : "bg-slate-700 text-gray-400 hover:bg-slate-600"
            }`}
            title={isFavorite() ? "Remove from favorites" : "Add to favorites"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill={isFavorite() ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
          <div className="relative mr-2">
            <button
              onClick={shareToClipboard}
              className="p-1.5 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-gray-400 hover:text-white"
              title="Share link to this pair"
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
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            </button>
            {showShareTooltip && (
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-slate-700 rounded text-xs whitespace-nowrap animate-fadeIn">
                Link copied!
              </span>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => copyToClipboard(pairAddress, "pair")}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
            >
              <span>{formatAddress(pairAddress)}</span>
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
            {copied === "pair" && (
              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-slate-700 rounded text-xs animate-fadeIn">
                Copied!
              </span>
            )}
          </div>
          <a
            href={`https://etherscan.io/address/${pairAddress}`}
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

      {children}
    </div>
  )
}

export default PairOverview

