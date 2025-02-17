// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "hardhat";

const BallotModule = buildModule("BallotModule", (m) => {

  const proposalNames = [
    ethers.encodeBytes32String("Proposal 1"),
    ethers.encodeBytes32String("Proposal 2"),
    ethers.encodeBytes32String("Proposal 3")
  ];

  const ballot = m.contract("Ballot", [proposalNames]);

  return {ballot };
});

export default BallotModule;
