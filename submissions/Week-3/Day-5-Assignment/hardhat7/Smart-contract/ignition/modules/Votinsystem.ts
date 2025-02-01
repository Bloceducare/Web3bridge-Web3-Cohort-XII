
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";



const VotingsystemModule = buildModule("VotingSystemModule", (m) => {
 

  const Votingsystem = m.contract("VotingSystem");

  return { Votingsystem };
});

export default VotingsystemModule;