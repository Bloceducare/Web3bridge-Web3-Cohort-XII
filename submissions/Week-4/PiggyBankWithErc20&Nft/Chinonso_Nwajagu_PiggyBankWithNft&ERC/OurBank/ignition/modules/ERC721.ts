
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const OurERC721Module = buildModule("OurERC721Module", (m) => {

  const name = "Cohort XII NFT";
  const symbol = "CXII-NFT";
  const erc = m.contract("OurERC721", [name, symbol]);

  return { erc };
});

export default OurERC721Module;