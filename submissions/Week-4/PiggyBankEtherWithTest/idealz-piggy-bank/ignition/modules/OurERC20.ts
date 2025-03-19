// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const OurERC20Module = buildModule("OurERC20Module", (m) => {

  const ourERC20 = m.contract("OurERC20", [name, symbol] );

  return { ourERC20 };
});

export default OurERC20Module;
