/// <reference types="vite/client" />

// Extend the Window interface to include the ethereum property
declare global {
    interface Window {
      ethereum?: EthereumProvider;
    }
  }

export {};