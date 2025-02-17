import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const YosemiteNftModule = buildModule("YosemiteNftModule", (m) => {
  const yosemiteNft = m.contract("YosemiteNft", []);

  return { yosemiteNft };
});

export default YosemiteNftModule;