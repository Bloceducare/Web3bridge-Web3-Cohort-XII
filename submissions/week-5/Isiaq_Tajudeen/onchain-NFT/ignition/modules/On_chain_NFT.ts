// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const On_chain_NFTModule = buildModule("On_chain_NFTModule", (m) => {
  const on_chain_NFT = m.contract("On_chain_NFT");

  return { on_chain_NFT };
});

export default On_chain_NFTModule;
