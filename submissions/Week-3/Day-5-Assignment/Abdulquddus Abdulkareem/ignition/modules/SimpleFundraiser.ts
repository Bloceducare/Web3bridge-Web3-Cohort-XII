// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const SimpleFundraiserModule = buildModule("SimpleFundraiserModule", (m) => {

  const goal = m.getParameter("goal", '604000000000000000000');

  const Fund = m.contract("SimpleFundraiser", [goal]); // Deploy the contract with the given goal
  return { Fund };
});

export default SimpleFundraiserModule;
