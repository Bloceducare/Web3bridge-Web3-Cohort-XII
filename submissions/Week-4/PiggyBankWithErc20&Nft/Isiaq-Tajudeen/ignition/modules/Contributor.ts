// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const NFTModule = buildModule("NFTModule", (m) => {
  const owner = "0xa748409456180ccb70FA34e8ee276297B9A2a1cC";

  const nft = m.contract("Contributor", [owner]);

  return { nft };
});

export default NFTModule;
