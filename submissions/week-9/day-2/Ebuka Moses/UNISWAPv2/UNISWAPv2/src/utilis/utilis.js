
import { JsonRpcProvider } from "ethers";
let readonlyProvider = null;

export const getReadOnlyProvider = () => {
    if (readonlyProvider) return readonlyProvider;
    readonlyProvider = new JsonRpcProvider(
        "https://eth-mainnet.g.alchemy.com/v2/NwAXSce5onxA02_iNQWbwGPgPi5Wo2C3"
    );

    return readonlyProvider;
};
