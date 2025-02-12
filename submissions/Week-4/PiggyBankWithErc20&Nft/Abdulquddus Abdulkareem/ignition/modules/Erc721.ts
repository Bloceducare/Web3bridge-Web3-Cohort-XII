// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const Erc721Module = buildModule("Erc721", (m) => {
     const name = "Slimany";
     const symbol = "SLM";
     // const tokenSupply = 6420;
     // const tokenSupply = m.getParameter("tokenAmount", 6420);

  const Erc721NFT = m.contract("Erc721", [name, symbol]);
  console.log(Erc721NFT);
  return { Erc721NFT };
  
});

export default Erc721Module;