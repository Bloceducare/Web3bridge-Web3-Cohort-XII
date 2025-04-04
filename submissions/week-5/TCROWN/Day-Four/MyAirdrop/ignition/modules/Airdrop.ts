// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const AirdropModule = buildModule("AirdropModule", (m) => {

  const airdrop = m.contract("Airdrop")
  return { airdrop };
});

export default AirdropModule;
