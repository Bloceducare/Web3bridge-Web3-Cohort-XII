// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "hardhat";

const PiggyBank = buildModule("PiggyBank", (m) => {
  const usdbContract = "";
  const NFTContract = "";
  const targetAmount = ethers.parseUnits("2000", 18);
  const withDrawalDay = 1739635076; // 7 days later not constant
  const manager = "0xa748409456180ccb70FA34e8ee276297B9A2a1cC";

  const piggyBank = m.contract("PiggyBank", [
    usdbContract,
    NFTContract,
    targetAmount,
    withDrawalDay,
    manager,
  ]);

  return { piggyBank };
});

export default PiggyBank;
