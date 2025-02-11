import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const MyERC20TokenModule = buildModule("MyERC20TokenModule", (m) => {
  
  const dlt = m.contract("MyERC20Token") 

  return { dlt};
});

export default MyERC20TokenModule;