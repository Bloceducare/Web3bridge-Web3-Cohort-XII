// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BallotModule = buildModule("BallotModule", (m) => {

  const ballots = m.contract("Ballot") // variable targeting my smartcontract

  return { ballots };
});

export default BallotModule;