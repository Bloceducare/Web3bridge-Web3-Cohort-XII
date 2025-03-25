import { useState } from 'react';
import InputForm from '../components/InputForm';
import PairInfoCard from '../components/PairInfoCard';
import { fetchPairData } from '../utils/multicall';
import { PairData } from '../types';

export default function Home() {
  const [pairData, setPairData] = useState<PairData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchData = async (address: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPairData(address);
      setPairData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl md:text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-8 animate-fade-in">
        Uniswap V2 Pair Explorer
      </h1>
      <div className="max-w-2xl mx-auto">
        <InputForm onSubmit={handleFetchData} />
        {loading && (
          <p className="text-center text-gray-400 mt-4 animate-pulse">Fetching pair data...</p>
        )}
        {error && (
          <p className="text-center text-red-400 mt-4 bg-red-900/20 p-3 rounded-lg">{error}</p>
        )}
        {pairData && (
          <div className="mt-8 animate-slide-up">
            <PairInfoCard pairData={pairData} />
          </div>
        )}
      </div>
    </div>
  );
}