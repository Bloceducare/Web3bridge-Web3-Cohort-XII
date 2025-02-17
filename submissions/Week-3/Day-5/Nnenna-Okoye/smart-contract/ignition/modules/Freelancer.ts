// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const FreelancerModule = buildModule("FreelancerModule", (m) => {
  
  const freelancer = m.contract("Freelancer");
   
  return { freelancer };
});

export default FreelancerModule;
