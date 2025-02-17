// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";



const SchoolManagerModule = buildModule("SchoolManagerModule", (m) => {


  const school = m.contract("SchoolManager");

  return { school };
});

export default SchoolManagerModule;
