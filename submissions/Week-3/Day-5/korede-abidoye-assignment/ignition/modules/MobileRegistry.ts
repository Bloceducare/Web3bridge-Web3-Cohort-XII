
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const MobileRegistryModule = buildModule("MobileRegistryModule", (m) => {


  const mobiles = m.contract("MobileRegistry");

  return { mobiles };
});

export default MobileRegistryModule;
