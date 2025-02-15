// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ErcT = buildModule("ErcT", (m) => {
  const erct = m.contract("ErcT", []);
  return { erct };
});

export default ErcT;