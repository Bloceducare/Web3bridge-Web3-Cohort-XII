// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ScholarshipFundModule = buildModule("ScholarshipFundModule", (m) => {
  const scholarship = m.contract("ScholarshipFund", []);
  return { scholarship };
});

export default ScholarshipFundModule