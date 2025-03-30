import { usePairContext } from '../context/PairContext';

export function PairSummary() {
  const { pairData } = usePairContext();

  if (!pairData) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-200">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Pair Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-50 p-4 rounded-md">
          <p className="text-slate-500 text-sm mb-1">Pair Address</p>
          <p className="font-mono text-sm break-all">{pairData.pair.address}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-md">
          <p className="text-slate-500 text-sm mb-1">LP Total Supply</p>
          <p className="font-mono">{pairData.pair.totalSupply}</p>
        </div>
      </div>
      
      <div className="mt-4 bg-slate-50 p-4 rounded-md">
        <p className="text-slate-500 text-sm mb-1">Last Updated</p>
        <p>{pairData.lastUpdated}</p>
      </div>
    </div>
  );
}