// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const EventContractModule = buildModule("EventContractModule", (m) => {
  

  const events = m.contract("EventContract");

  return { events };
});

export default EventContractModule;
