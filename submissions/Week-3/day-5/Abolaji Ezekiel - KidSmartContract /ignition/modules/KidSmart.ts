// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";



const KidSmartModule = buildModule("KidSmartModule", (m) => {


  const simple = m.contract("KidSmart")
  return { simple };
});

export default KidSmartModule;
