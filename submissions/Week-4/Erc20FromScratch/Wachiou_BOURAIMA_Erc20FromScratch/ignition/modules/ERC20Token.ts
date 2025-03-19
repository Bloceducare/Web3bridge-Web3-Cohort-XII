// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ERC20TokenModule = buildModule("ERC20TokenModule", (m) => {
  const token = m.contract("ERC20Token");

  return { token };
});

export default ERC20TokenModule;
