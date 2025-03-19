import { ethers } from 'ethers';

const RPC_URL = import.meta.env.VITE_RPC_URL;

export function getReadOnlyProvider() {
  return new ethers.providers.JsonRpcProvider(RPC_URL);
}

