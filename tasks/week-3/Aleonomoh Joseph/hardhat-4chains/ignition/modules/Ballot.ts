// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// const _proposalNames = ["leo", "sam"];

const BallotModule = buildModule("BallotModule", (m) => {
  // const proposalNames = m.getParameter("unlockTime", _proposalNames);

  const lock = m.contract("Ballot");

  return { lock };
});

export default BallotModule;
