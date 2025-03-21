// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";



const SavingBankModule = buildModule("SavingBankModule", (m) => {


  const bank = m.contract("SavingBank");

  return { bank };
});

export default SavingBankModule;
