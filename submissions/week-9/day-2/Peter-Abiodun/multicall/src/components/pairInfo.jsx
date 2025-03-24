// src/components/pairInfo.jsx
import { formatReserves } from '../utils/Uniswap';

function PairInfo({ pairData }) {
  // Safety check if pairData is incomplete
  if (!pairData || !pairData.token0 || !pairData.token1 || !pairData.reserves) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-red-500">Incomplete pair data received. Please try again.</p>
      </div>
    );
  }
  
  const { token0, token1, reserves, totalSupply } = pairData;
  
  // Safely extract reserve values with fallbacks
  const reserve0 = reserves && reserves._reserve0 ? reserves._reserve0 : "0";
  const reserve1 = reserves && reserves._reserve1 ? reserves._reserve1 : "0";
  const blockTimestamp = reserves && reserves._blockTimestampLast ? Number(reserves._blockTimestampLast) : 0;
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-purple-600 text-white p-4">
        <h2 className="text-xl font-bold">Pair Information</h2>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Token 0 */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-3 text-purple-700">Token 0</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {token0.name || "Unknown"}</p>
              <p><span className="font-medium">Symbol:</span> {token0.symbol || "?"}</p>
              <p><span className="font-medium">Decimals:</span> {token0.decimals !== undefined ? token0.decimals.toString() : "18"}</p>
              <p className="break-all"><span className="font-medium">Address:</span> {token0.address}</p>
              <p><span className="font-medium">Reserve:</span> {formatReserves(reserve0, token0.decimals || 18)} {token0.symbol || ""}</p>
            </div>
          </div>
          
          {/* Token 1 */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold mb-3 text-purple-700">Token 1</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {token1.name || "Unknown"}</p>
              <p><span className="font-medium">Symbol:</span> {token1.symbol || "?"}</p>
              <p><span className="font-medium">Decimals:</span> {token1.decimals !== undefined ? token1.decimals.toString() : "18"}</p>
              <p className="break-all"><span className="font-medium">Address:</span> {token1.address}</p>
              <p><span className="font-medium">Reserve:</span> {formatReserves(reserve1, token1.decimals || 18)} {token1.symbol || ""}</p>
            </div>
          </div>
        </div>
        
        {/* Pair Data */}
        <div className="mt-6 bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-3 text-purple-700">Pair Details</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Total Supply:</span> {formatReserves(totalSupply || "0", 18)} LP Tokens</p>
            <p><span className="font-medium">Last Updated:</span> {blockTimestamp ? new Date(blockTimestamp * 1000).toLocaleString() : "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PairInfo;