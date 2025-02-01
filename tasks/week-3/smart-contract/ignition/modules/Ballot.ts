import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { ethers } from "ethers";

const BallotModule = buildModule("BallotModule", (m) => {
  const candidates = ["Alice", "Bob", "Charlie"].map((name) =>
    ethers.encodeBytes32String(name)
  );

  const simple = m.contract("Ballot", [candidates]);

  return { simple };
});

export default BallotModule;
