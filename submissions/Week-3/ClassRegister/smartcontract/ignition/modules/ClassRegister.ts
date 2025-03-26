// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ClassRegisterModule = buildModule("ClassRegisterModule", (m) => {
  const classRegister = m.contract("ClassRegister");

  return { classRegister };
});

export default ClassRegisterModule;
