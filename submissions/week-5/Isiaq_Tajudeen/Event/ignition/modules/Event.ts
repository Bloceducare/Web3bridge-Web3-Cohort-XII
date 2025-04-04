// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const EventModule = buildModule("EventModule", (m) => {
  const event = m.contract("Event");

  return { event };
});

export default EventModule;
