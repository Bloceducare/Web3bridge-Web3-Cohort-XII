import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ERC20Module = buildModule("ERC20Module", (m) => {
 
  const name = m.getParameter<string>("name", "CeCe");
  const symbol = m.getParameter<string>("symbol", "CIS");
  const initialSupply = m.getParameter<bigint>("initialSupply", 1_000_000n); 

  // const name = m.getParameter<string>("name");
  // const symbol = m.getParameter<string>("symbol");
  // const initialSupply = m.getParameter<bigint>("initialSupply");

  const deployer = m.getAccount(0);

 //deploy with parameters
  const erc20 = m.contract("CECE", [name, symbol, initialSupply]);

  return { erc20 };
});

export default ERC20Module;
