// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const EventModule = buildModule("EventModule", (m) => {
  const eventContract = m.contract("EventContract");

  return { eventContract };
});

export default EventModule;
