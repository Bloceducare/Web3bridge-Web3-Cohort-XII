import { useState } from 'react';
import { PairToken } from '../utils/fetchPairList';

interface AddressCardProps {
  pair: PairToken;
}

export default function AddressCard({ pair }: AddressCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(pair.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-xl flex justify-between items-center transition-all duration-300 hover:bg-gray-700">
      <div>
        <p className="text-white font-medium">{pair.name}</p>
        <p className="text-sm text-gray-400 break-all">{pair.address}</p>
      </div>
      <button
        onClick={handleCopy}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
          copied ? 'bg-green-500 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'
        }`}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}