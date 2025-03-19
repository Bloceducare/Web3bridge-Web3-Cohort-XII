// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const EtherWalletModule = buildModule("EtherWalletModule", (m) => {

  const etherWallet = m.contract("EtherWallet");

  return { etherWallet };
});

export default EtherWalletModule;
