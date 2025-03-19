// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PiggyBankModule = buildModule("PiggyBankModule", (m) => {
  
  const targetAmount = m.getParameter<bigint>("targetAmount", 10n ** 18n); 
  const withdrawalDate = m.getParameter<number>("withdrawalDate", Math.floor(Date.now() / 1000) + 604800);
  const manager = m.getAccount(0); 

  //deploy PiggyBank contract
  const piggyBank = m.contract("PiggyBank", [targetAmount, withdrawalDate, manager]);

  return { piggyBank };
});

export default PiggyBankModule;
