
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";



const BallotModule = buildModule("BallotModule", (m) => {
 

  const Ballot = m.contract("Ballot");

  return { Ballot };
});

export default BallotModule;
