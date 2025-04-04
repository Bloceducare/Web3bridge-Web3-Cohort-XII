// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const KMSERC721Module = buildModule("KMSERC721Module", (m) => {

  const name = "KMS NFT CONTRACT";
  const symbol = "CXII-NFT";
  const erc = m.contract("KMSERC721", [name, symbol]);

  return { erc };
});

export default KMSERC721Module;

