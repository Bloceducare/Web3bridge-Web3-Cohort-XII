import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ClassRegistrationModule = buildModule("ClassRegistrationModule", (m) => {
  const classRegistration = m.contract("ClassRegistration");

  return { classRegistration };
});

export default ClassRegistrationModule;
