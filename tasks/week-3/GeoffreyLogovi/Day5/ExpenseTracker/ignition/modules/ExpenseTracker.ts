// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ExpenseTrackerModule = buildModule("ExpenseTrackerModule", (m) => {
 
  const expenseTracker = m.contract("ExpenseTracker");

  return { expenseTracker };
});

export default ExpenseTrackerModule;
