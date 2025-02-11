import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";



const Web3CXIModule = buildModule("Web3CXIModule", (m) => {
  

  const erc20 = m.contract("Web3CXI");

  return { erc20 };
});

export default Web3CXIModule;


//0x69E13A3224243Ccd88f411174721B38327D2b9c4