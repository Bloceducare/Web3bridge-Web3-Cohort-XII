import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const eventContractModule = buildModule("EventContractModule", (m) => {
  

  const event = m.contract("EventContract");

  return { event };
});

export default eventContractModule;