// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const InheritanceWillModule = buildModule("InheritanceWillModule", (m) => {
  const sonAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Replace with a valid Ethereum address for the son
  const unlockDelay = 365 * 24 * 60 * 60; // Example: 1 year in seconds

  // Make sure you are passing the contract name and arguments properly
  const inheritance = m.contract("InheritanceWill", [sonAddress, unlockDelay], {
    value: 100000000n, // 0.1 Ether (in wei) using BigInt notation

  });

  return { inheritance };
});

export default InheritanceWillModule;

