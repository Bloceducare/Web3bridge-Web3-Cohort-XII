// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const BallotStorage = buildModule("BallotStorage", (m) => {

  const ballot = m.contract("BallotStorage");

  return { ballot };
});

export default BallotStorage;
