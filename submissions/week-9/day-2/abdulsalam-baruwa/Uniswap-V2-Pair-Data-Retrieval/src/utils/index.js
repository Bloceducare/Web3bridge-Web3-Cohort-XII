import { JsonRpcProvider } from "ethers";

let readonlyProvider = null;

export const getReadOnlyProvider = () => {
    if (readonlyProvider) return readonlyProvider;
    readonlyProvider = new JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/9eVwsEHVGABEzSLEcLfbUqZyES0jlBuC");
    return readonlyProvider;
};