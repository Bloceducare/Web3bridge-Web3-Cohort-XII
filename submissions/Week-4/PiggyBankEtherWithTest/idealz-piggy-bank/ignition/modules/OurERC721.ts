// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const OurERC721Module = buildModule("OurERC721Module", (m) => {

  const ourERC721 = m.contract("OurERC721", [name, symbol] );

  return { ourERC721 };
});

export default OurERC721Module;
