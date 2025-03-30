import { createContext, useState, useContext } from 'react';

const PairContext = createContext();

// Custom hook to use the context
export function usePairContext() {
  const context = useContext(PairContext);
  if (!context) {
    throw new Error('usePairContext must be used within a PairContextProvider');
  }
  return context;
}

// Provider component
export function PairContextProvider({ children }) {
  const [pairAddress, setPairAddress] = useState('');
  const [pairData, setPairData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Values to be provided to consumers
  const value = {
    pairAddress,
    setPairAddress,
    pairData,
    setPairData,
    loading,
    setLoading,
    error,
    setError
  };

  return (
    <PairContext.Provider value={value}>
      {children}
    </PairContext.Provider>
  );
}