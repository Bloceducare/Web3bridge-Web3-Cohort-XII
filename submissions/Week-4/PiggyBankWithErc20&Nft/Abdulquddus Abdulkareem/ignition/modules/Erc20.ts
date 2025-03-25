// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const Erc20Module = buildModule("Erc20", (m) => {
     const name = "Slimany";
     const symbol = "SLM";
     const tokenSupply = 6420;
     // const tokenSupply = m.getParameter("tokenAmount", 6420);

  const Erc20Token = m.contract("Erc20", [name, symbol, tokenSupply]);
  console.log(Erc20Token);
  return { Erc20Token };
  
});

export default Erc20Module;