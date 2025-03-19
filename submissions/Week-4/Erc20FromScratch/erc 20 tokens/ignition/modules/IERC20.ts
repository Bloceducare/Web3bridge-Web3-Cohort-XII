// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const IERC20Module = buildModule("iERC20Module", (m) => {

  const iERC20 = m.contract("IERC20" );

  return { iERC20};
});

export default IERC20Module;
