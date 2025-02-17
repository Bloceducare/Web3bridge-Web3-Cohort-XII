import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const USDBModule = buildModule("USDBModule", (m) => {
  const owner = "0xa748409456180ccb70FA34e8ee276297B9A2a1cC";

  const usdb = m.contract("USDB", [owner]);

  return { usdb };
});

export default USDBModule;
