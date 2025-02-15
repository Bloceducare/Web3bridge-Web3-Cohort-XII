// This setup uses Hardhat Ignition to manage the JobMarketPlace deployment.

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const JobMarketPlaceModule = buildModule("JobMarketPlaceModule", (m) => {

  const lock = m.contract("JobMarketPlace");

  return { lock };
});

export default JobMarketPlaceModule;