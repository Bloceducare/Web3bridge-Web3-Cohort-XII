// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const adminAddress = "0x6D2Dd04bF065c8A6ee9CeC97588AbB0f967E0df9";

const SchoolManagementModule = buildModule("SchoolManagementModule", (m) => {
  const  SchoolManagement = m.contract("SchoolManagement", [adminAddress]);
    

  return { SchoolManagement };
});

export default SchoolManagementModule;
