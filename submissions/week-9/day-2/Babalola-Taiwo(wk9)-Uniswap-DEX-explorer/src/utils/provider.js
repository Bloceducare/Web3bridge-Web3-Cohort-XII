import { ethers } from "ethers"

export const getReadOnlyProvider = () => {
  const alchemyUrl = import.meta.env.VITE_ALCHEMY_API_KEY

  const providerUrl = alchemyUrl || "https://eth-mainnet.g.alchemy.com/v2/NwAXSce5onxA02_iNQWbwGPgPi5Wo2C3"

  console.log("Using provider URL:", providerUrl)

  return new ethers.JsonRpcProvider(providerUrl, "mainnet")
}

