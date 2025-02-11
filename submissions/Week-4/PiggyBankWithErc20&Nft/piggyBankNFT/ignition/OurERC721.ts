// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const OurPiggyBankModule = buildModule("OurPiggyBankModule", (m) => {
 

  const Piggy = m.contract("OurPiggyBank");

  return { Piggy };
});

export default OurPiggyBankModule;
