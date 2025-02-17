// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SupplyChainManagementModule = buildModule("SupplyChainManagementModule", (m) => {

  const management = m.contract("SupplyChainManagement");

  return { management };
});

export default SupplyChainManagementModule;
