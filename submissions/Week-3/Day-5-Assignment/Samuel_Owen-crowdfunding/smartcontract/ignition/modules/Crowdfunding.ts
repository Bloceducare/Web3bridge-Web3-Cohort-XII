// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const CrowdfundingModule = buildModule("Crowdfunding", (m) => {
 
  const crowd = m.contract("Crowdfunding",);

  return { crowd };
});

export default CrowdfundingModule;
