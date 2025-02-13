import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BallotModule = buildModule("Ballot", (m) => {

  const ballot = m.contract("Ballot", []);

  return { ballot };
});

export default BallotModule;