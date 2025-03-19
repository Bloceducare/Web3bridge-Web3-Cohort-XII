// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";



const CardValidatorModule = buildModule("CardValidatorModule", (m) => {
  

  const validator = m.contract("CardValidatorModule");

  return { validator };
});

export default CardValidatorModule;
