// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const name = "WassNFT";
const symbol = "WNFT";
const totalSupply = 10;

const MyNFTModule = buildModule("MyNFTModule", (m) => {

    const nft = m.contract("MyNFT", [name, symbol, totalSupply]);

    return { nft };
});

export default MyNFTModule;
