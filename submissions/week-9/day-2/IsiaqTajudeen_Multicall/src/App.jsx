import { PairContextProvider } from "./context/PairContext";
import { SearchBar } from "./components/SearchBar";
import { ErrorMessage } from "./components/ErrorMessage";
import { PairSummary } from "./components/PairSummary";
import { TokenCard } from "./components/TokenCard";
import { usePairContext } from "./context/PairContext";

function App() {
  const { pairData } = usePairContext();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto py-12 px-4">
        {/* Header with*/}
        <div className="bg-slate-700 rounded-lg shadow-md p-6 mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">
            Uniswap V2 Pair Explorer
          </h1>
          <p className="mt-2 text-slate-300">Analyze liquidity pair details</p>
        </div>

        <SearchBar />
        <ErrorMessage />

        {pairData && (
          <div className="space-y-6 mb-8">
            <PairSummary />

            {/* Token cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TokenCard token={pairData.token0} index={0} />
              <TokenCard token={pairData.token1} index={1} />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 text-center text-slate-500 text-sm">
          <p>Uniswap V2 Pair Explorer</p>
        </div>
      </div>
    </div>
  );
}

export default App;
