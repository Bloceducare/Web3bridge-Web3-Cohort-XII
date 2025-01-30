// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BallotModule = buildModule("BallotModule", (m) => {
  const Ballot = m.contract("Ballot"); // Deploy the contract without constructor

  m.call(Ballot, "initialize", [
    [
      "0x50726f706f73616c310000000000000000000000000000000000000000000000", // "Proposal1"
      "0x50726f706f73616c320000000000000000000000000000000000000000000000"  // "Proposal2"
    ]
  ]);

  return { Ballot };
});

export default BallotModule;

