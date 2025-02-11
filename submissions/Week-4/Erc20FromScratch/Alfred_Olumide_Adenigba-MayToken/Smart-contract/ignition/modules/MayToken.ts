// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const MayTokenModule = buildModule("MayTokenModule", (m) => {
  // Define constructor arguments
  const name = "MayToken";
  const symbol = "MTK";
  const initialSupply = 10; // 1 million tokens
  const owner = m.getAccount(0); // The first account deploying the contract

  const maytoken = m.contract("MayToken", [name, symbol, initialSupply, owner]);

  return { maytoken };
});

export default MayTokenModule;
