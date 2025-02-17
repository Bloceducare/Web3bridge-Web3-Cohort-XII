import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("VotingModule", (m) => {
    const candidateNames = ["Alice", "Bob", "Charlie"];
    const votingContract = m.contract("DecentralizedVoting", [candidateNames]);
    return { votingContract };
});