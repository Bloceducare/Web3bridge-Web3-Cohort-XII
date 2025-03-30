import { PairData } from '../types';
import TokenInfo from './TokenInfo';

interface PairInfoCardProps {
  pairData: PairData;
}

export default function PairInfoCard({ pairData }: PairInfoCardProps) {
  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-white">
        {pairData.token0.symbol}/{pairData.token1.symbol}
      </h2>
      <p className="text-sm text-gray-400 mb-4 break-all">Address: {pairData.pairAddress}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <TokenInfo token={pairData.token0} reserve={pairData.reserves0} />
        <TokenInfo token={pairData.token1} reserve={pairData.reserves1} />
      </div>
      <p className="text-sm font-medium text-gray-300 bg-gray-900 p-3 rounded-lg">
        Total Supply: {pairData.totalSupply} LP Tokens
      </p>
    </div>
  );
}