// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DiplomaHandlerModule = buildModule("DiplomaHandlerModule", (m) => {
  

  const diploma = m.contract("DiplomaHandler");

  return { diploma };
});

export default DiplomaHandlerModule;
