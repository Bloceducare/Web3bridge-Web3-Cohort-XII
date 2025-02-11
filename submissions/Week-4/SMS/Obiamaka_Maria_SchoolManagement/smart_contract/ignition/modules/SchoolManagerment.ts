// This setup uses Hardhat Ignition to manage smart contract deployments.

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const SchoolManagementModule = buildModule("SchoolManagementModule", (m) => {


  const scm = m.contract("SchoolManagement");

  return {scm};
});

export default SchoolManagementModule;
