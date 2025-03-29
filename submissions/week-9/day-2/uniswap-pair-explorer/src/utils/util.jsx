import { JsonRpcProvider } from "ethers";

let readonlyProvider = null;

export const getReadOnlyProvider = () => {
    if (readonlyProvider) return readonlyProvider;
    
    // Connect to Ethereum mainnet via a public RPC
    readonlyProvider = new JsonRpcProvider("https://ethereum.publicnode.com");
    


    return readonlyProvider;
};