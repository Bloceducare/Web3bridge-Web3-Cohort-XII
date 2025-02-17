import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const piggyBankModule = buildModule("piggyBankModule", (m) => {

  const piggyBank = m.contract("piggyBank")

  return { piggyBank };
});

export default piggyBankModule;
