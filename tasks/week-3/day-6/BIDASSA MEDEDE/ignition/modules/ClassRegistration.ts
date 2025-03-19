// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ClassRegistrationModule = buildModule("ClassRegistrationModule", (m) => {

  const classRegistration = m.contract("ClassRegistration");

  return { classRegistration };
});

export default ClassRegistrationModule;
