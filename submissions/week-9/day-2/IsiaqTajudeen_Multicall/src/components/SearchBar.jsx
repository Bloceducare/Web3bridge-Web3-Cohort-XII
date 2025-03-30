import { usePairContext } from '../context/PairContext';
import { usePairData } from '../hooks/usePairData';

export function SearchBar() {
  const { pairAddress, setPairAddress, loading } = usePairContext();
  const { fetchPairData } = usePairData();

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-slate-200">
      <div className="flex flex-col space-y-4">
        <label htmlFor="pairAddress" className="text-slate-700 font-medium">
          Enter Uniswap V2 Pair Address
        </label>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            id="pairAddress"
            type="text"
            value={pairAddress}
            onChange={(e) => setPairAddress(e.target.value)}
            placeholder="0x..."
            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring focus:ring-slate-400 bg-white"
          />
          <button
            onClick={fetchPairData}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-medium ${
              loading
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-slate-600 hover:bg-slate-700 text-white transition-colors'
            }`}
          >
            {loading ? 'Loading...' : 'Fetch Data'}
          </button>
        </div>
      </div>
    </div>
  );
}