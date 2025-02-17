import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const Ballot = buildModule("Ballot", (m) => {

const ballot = m.contract("Ballot");

return { ballot };
});

export default Ballot;
