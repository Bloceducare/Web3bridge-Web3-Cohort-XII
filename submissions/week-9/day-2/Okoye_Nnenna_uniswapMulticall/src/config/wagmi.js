import { createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";

export const supportedNetworks = [mainnet];

export const config = createConfig({
    chains: supportedNetworks,
    transports: {
        [mainnet]: http(),
    },
});
