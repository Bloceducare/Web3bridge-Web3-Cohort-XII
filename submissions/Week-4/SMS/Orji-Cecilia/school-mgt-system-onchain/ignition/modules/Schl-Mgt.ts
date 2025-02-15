// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SchlMgtModule = buildModule("SchlMgtModule", (m) => {
  // Define the contract's constructor arguments
  const adminAddress = m.getParameter("adminAddress", "0xAf50C37C8B4534670cfE2099ff205c1a0Df88D3d");

  // Deploy the contract
  const schlMgt = m.contract("SchlMgt", [adminAddress]);

  // Return the contract instance
  return { schlMgt };
});

export default SchlMgtModule;

