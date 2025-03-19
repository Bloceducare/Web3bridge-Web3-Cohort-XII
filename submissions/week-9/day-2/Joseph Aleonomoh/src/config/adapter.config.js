import { getClient, getConnectorClient } from "@wagmi/core";
import {
    FallbackProvider,
    JsonRpcProvider,
    BrowserProvider,
    JsonRpcSigner,
} from "ethers";

export function clientToProvider(client) {
    const { chain, transport } = client;
    const network = {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
    };
    if (transport.type === "fallback") {
        const providers = transport.transports.map(
            ({ value }) => new JsonRpcProvider(value?.url, network)
        );
        if (providers.length === 1) return providers[0];
        return new FallbackProvider(providers);
    }
    return new JsonRpcProvider(transport.url, network);
}

/** Action to convert a viem Client to an ethers.js Provider. */
export function getEthersProvider(config, { chainId } = {}) {
    const client = getClient(config, { chainId });
    if (!client) return;
    return clientToProvider(client);
}

export function clientToSigner(client) {
    const { account, chain, transport } = client;

    const network = {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
    };
    const provider = new BrowserProvider(transport, network);
    const signer = new JsonRpcSigner(provider, account.address);
    return signer;
}

/** Action to convert a viem Wallet Client to an ethers.js Signer. */
export async function getEthersSigner(config, { chainId } = {}) {
    const client = await getConnectorClient(config, { chainId });
    return clientToSigner(client);
}
