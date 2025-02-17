// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DecentralizedVotingModule = buildModule("DecentralizedVotingModule", (m) => {
  const decentralizedVoting = m.contract("DecentralizedVoting");
  return { decentralizedVoting };
});
export default DecentralizedVotingModule;
