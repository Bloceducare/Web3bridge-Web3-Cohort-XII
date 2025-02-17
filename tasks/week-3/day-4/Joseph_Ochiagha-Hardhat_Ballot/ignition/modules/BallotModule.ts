import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BallotModule = buildModule("BallotModule", (m) => {
  const ballot = m.contract("Ballot");

  return { ballot };
});

export default BallotModule;
