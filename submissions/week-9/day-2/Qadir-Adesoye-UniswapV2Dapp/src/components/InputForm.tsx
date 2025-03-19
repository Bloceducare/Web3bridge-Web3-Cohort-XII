import { useState, FormEvent } from 'react';

interface InputFormProps {
  onSubmit: (address: string) => void;
}

export default function InputForm({ onSubmit }: InputFormProps) {
  const [address, setAddress] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(address);
    setAddress('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter Uniswap V2 Pair Address (e.g., 0xB4e16d...)"
          className="flex-1 p-4 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
        />
        <button
          type="submit"
          className="px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-md"
        >
          Fetch Data
        </button>
      </div>
    </form>
  );
}