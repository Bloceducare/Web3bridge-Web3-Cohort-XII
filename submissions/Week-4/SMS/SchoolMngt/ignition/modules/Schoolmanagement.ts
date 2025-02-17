// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";



const SchoolmanagementModule = buildModule("SchoolmanagementModule", (m) => {
  

  const lock = m.contract("Schoolmanagement");

  return { lock };
});

export default SchoolmanagementModule;
