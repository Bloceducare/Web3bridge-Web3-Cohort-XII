// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const NewEventModule = buildModule("NewEventModule", (m) => {

  const NewEvent = m.contract("NewEvent");

  return { NewEvent };
});

export default NewEventModule;


