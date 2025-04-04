import { ethers, JsonRpcProvider } from "ethers";

let readOnlyProvider = null;

export const getReadOnlyProvider = () => {
  if (readOnlyProvider) return readOnlyProvider;

  readOnlyProvider = new JsonRpcProvider(import.meta.env.VITE_ALCHEMY_URL);

  return readOnlyProvider;
};
