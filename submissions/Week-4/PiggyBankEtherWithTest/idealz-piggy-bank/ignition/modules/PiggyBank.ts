// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const PiggyBankModule = buildModule("PiggyBankModule", (m) => {

  const piggyBank = m.contract("PiggyBank");

  return { piggyBank };
});

export default PiggyBankModule;
