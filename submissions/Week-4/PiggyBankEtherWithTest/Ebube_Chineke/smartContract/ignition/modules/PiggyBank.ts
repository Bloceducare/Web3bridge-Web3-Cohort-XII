// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PiggyBank = buildModule("PiggyBank", (m) => {
  const erct = m.contract("PiggyBank", []);
  return { erct };
});

export default PiggyBank;