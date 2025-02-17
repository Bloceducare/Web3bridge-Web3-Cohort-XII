// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

let name = "MededeNFT";
let symbol = "MNFT";
let baseURI = "data:image/svg+xml;base64,PHN2ZyB4b";

const MededeNFTModule = buildModule("MededeNFTModule", (m) => {

  const mededeNFT = m.contract("MededeNFT", [name, symbol, baseURI]);

  return { mededeNFT };
});

export default MededeNFTModule;