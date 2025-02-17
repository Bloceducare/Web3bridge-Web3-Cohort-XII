// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const ERC20 = buildModule("ERC20", (m) => {
 

  const erc = m.contract("ERC20");

  return { erc };
});

export default ERC20;


npx hardhat ignition deploy ./ignition/modules/Lock.ts --network localhost