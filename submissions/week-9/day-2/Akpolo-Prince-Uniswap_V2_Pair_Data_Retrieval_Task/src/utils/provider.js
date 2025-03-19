import { JsonRpcProvider } from "ethers";
import { supportedNetworks } from "../config/wagmi";


let readonlyProvider = null;

export const getReadOnlyProvider = () => {
    if (readonlyProvider) return readonlyProvider;
    readonlyProvider = new JsonRpcProvider(
        supportedNetworks[0].rpcUrls.default.http[0]
    );

    return readonlyProvider;
};

export const isSupportedNetwork = (chainId) => {
    return supportedNetworks.some((network) => network.id === chainId);
};
