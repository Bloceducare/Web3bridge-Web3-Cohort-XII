// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const MyTestTokenModule = buildModule("LockModule", (m) => {


  const Token = m.contract("MyTestToken");

  return { Token};
});

export default MyTestTokenModule;
