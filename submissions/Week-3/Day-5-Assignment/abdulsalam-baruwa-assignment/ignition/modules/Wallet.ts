// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const WalletModule = buildModule("WalletModule", (m) => {

  const wallet = m.contract("Wallet", []);

  return { wallet };
});

export default WalletModule;
