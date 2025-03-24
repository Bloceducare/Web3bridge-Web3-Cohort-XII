// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";



const MyAirdropModule = buildModule("MyAirdropModule", (m) => {

 
    const airdrop = m.contract("MyAirdrop");

  return { airdrop };
});

export default MyAirdropModule;