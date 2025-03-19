import React, { useState } from 'react';
import { usePairDataContext } from '../context/PairDataProvider';
import { ethers } from 'ethers';
import '../styles/PairDataViewer.css';

// For ethers v5, use this:
// import { formatUnits } from 'ethers/lib/utils';

const PairDataViewer = () => {
  const { 
    pairAddress, 
    setPairAddress, 
    pairData, 
    isLoading, 
    error, 
    fetchPairData 
  } = usePairDataContext();

  const [copyNotification, setCopyNotification] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchPairData(pairAddress);
  };

  const formatReserve = (reserve, decimals) => {
    // Use ethers.utils.formatUnits for ethers v6
    return Number(ethers.utils.formatUnits(reserve, decimals)).toLocaleString(undefined, {
      maximumFractionDigits: 6
    });
  };

  const truncateAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopyNotification(`${type} copied to clipboard!`);
    setTimeout(() => setCopyNotification(''), 2000);
  };

  return (
    <div className="pair-data-container">
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-primary)' }}>
        Uniswap V2 Pair Explorer
      </h1>
      
      <form onSubmit={handleSubmit} className="search-form">
        <div className="input-group">
          <input
            type="text"
            value={pairAddress}
            onChange={(e) => setPairAddress(e.target.value)}
            placeholder="Enter Uniswap V2 Pair Address (0x...)"
            className="address-input"
          />
          <button type="submit" disabled={isLoading} className="search-button">
            {isLoading ? (
              <span>Loading...</span>
            ) : (
              <span>Fetch Data</span>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="error-message">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" style={{ width: '20px', height: '20px', display: 'inline-block', marginRight: '8px', verticalAlign: 'text-bottom' }}>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {copyNotification && (
        <div className="copy-indicator">
          {copyNotification}
        </div>
      )}

      {pairData && (
        <div className="pair-data">
          <h2>Pair Information</h2>
          <div className="pair-address" onClick={() => copyToClipboard(pairData.address, 'Pair address')} style={{ cursor: 'pointer' }}>
            <strong>Pair Address:</strong> {pairData.address}
            <span style={{ marginLeft: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              (Click to copy)
            </span>
          </div>

          <div className="tokens-container">
            <div className="token-card">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Token 0 ({pairData.token0.symbol})</h3>
              </div>
              <div><strong>Name:</strong> {pairData.token0.name}</div>
              <div style={{ cursor: 'pointer' }} onClick={() => copyToClipboard(pairData.token0.address, 'Token 0 address')}>
                <strong>Address:</strong> {truncateAddress(pairData.token0.address)}
                <span style={{ marginLeft: '4px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>(Click to copy)</span>
              </div>
              <div><strong>Decimals:</strong> {pairData.token0.decimals.toString()}</div>
              <div style={{ color: 'var(--primary-color)', fontWeight: '600', fontSize: '1.125rem' }}>
                <strong>Reserve:</strong> {formatReserve(pairData.token0.reserve, pairData.token0.decimals)} {pairData.token0.symbol}
              </div>
            </div>

            <div className="token-card">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <h3>Token 1 ({pairData.token1.symbol})</h3>
              </div>
              <div><strong>Name:</strong> {pairData.token1.name}</div>
              <div style={{ cursor: 'pointer' }} onClick={() => copyToClipboard(pairData.token1.address, 'Token 1 address')}>
                <strong>Address:</strong> {truncateAddress(pairData.token1.address)}
                <span style={{ marginLeft: '4px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>(Click to copy)</span>
              </div>
              <div><strong>Decimals:</strong> {pairData.token1.decimals.toString()}</div>
              <div style={{ color: 'var(--primary-color)', fontWeight: '600', fontSize: '1.125rem' }}>
                <strong>Reserve:</strong> {formatReserve(pairData.token1.reserve, pairData.token1.decimals)} {pairData.token1.symbol}
              </div>
            </div>
          </div>

          <div className="additional-info">
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Pool Statistics</h3>
            <div>
              <strong>LP Total Supply:</strong> {Number(ethers.utils.formatUnits(pairData.totalSupply, 18)).toLocaleString(undefined, { maximumFractionDigits: 2 })} LP Tokens
            </div>
            <div>
              <strong>Constant Product (K):</strong> {Number(pairData.lastK).toExponential(4)}
            </div>
            <div>
              <strong>Last Updated:</strong> {new Date(pairData.blockTimestampLast * 1000).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PairDataViewer;