// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const EventContractModule = buildModule("EventContractModule", (m) => {
  

  const EventContract = m.contract("EventContract");

  return { EventContract };
});

export default EventContractModule;
