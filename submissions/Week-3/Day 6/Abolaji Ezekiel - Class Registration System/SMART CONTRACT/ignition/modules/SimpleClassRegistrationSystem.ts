// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";



const SimpleClassRegistrationSystemeModule = buildModule("SimpleClassRegistrationSystem", (m) => {


  const simple = m.contract("SimpleClassRegistrationSystem")
  return { simple };
});

export default SimpleClassRegistrationSystemeModule;
