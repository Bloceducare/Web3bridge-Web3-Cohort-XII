// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const Erc20TokenModule = buildModule("Erc20TokenModule", (m) => {


  const lock = m.contract("Erc20Token");

  return { lock };
});

export default Erc20TokenModule;
