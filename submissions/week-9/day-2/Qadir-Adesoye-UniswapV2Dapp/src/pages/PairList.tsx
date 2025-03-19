import { useState, useEffect } from 'react';
import AddressCard from '../components/AddressCard';
import { fetchPairList, fetchTotalPairs, PairToken } from '../utils/fetchPairList';

export default function PairList() {
  const [pairs, setPairs] = useState<PairToken[]>([]);
  const [totalPairs, setTotalPairs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const limit = 10; // Number of pairs per load

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const initialPairs = await fetchPairList(limit, 0);
        const total = await fetchTotalPairs();
        setPairs(initialPairs);
        setTotalPairs(total);
      } catch (err) {
        setError('Failed to load pair list');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const handleLoadMore = async () => {
    setLoading(true);
    try {
      const newPairs = await fetchPairList(limit, offset + limit);
      setPairs((prev) => [...prev, ...newPairs]);
      setOffset((prev) => prev + limit);
    } catch (err) {
      setError('Failed to load more pairs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl md:text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-8 animate-fade-in">
        Uniswap V2 Pair Addresses
      </h1>
      <p className="text-center text-gray-300 mb-6">
        Source:{' '}
        <a
          href="https://tokenlists.org/token-list?url=https://raw.githubusercontent.com/jab416171/uniswap-pairtokens/master/uniswap_pair_tokens.json"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 hover:text-purple-300"
        >
          Uniswap Pair Tokens List
        </a>
      </p>
      {loading && offset === 0 && (
        <p className="text-center text-gray-400 animate-pulse">Loading pairs...</p>
      )}
      {error && (
        <p className="text-center text-red-400 bg-red-900/20 p-3 rounded-lg">{error}</p>
      )}
      <div className="grid grid-cols-1 gap-4 max-w-3xl mx-auto">
        {pairs.map((pair) => (
          <AddressCard key={pair.address} pair={pair} />
        ))}
      </div>
      {offset + limit < totalPairs && (
        <div className="mt-8 text-center">
          <button
            onClick={handleLoadMore}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-md"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}