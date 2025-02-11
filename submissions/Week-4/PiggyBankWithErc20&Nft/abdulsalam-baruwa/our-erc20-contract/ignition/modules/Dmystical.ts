// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DmysticalModule = buildModule("DmysticalModule", (m) => {

  const dmystical = m.contract("Dmystical");

  return { dmystical };
});

export default DmysticalModule;
