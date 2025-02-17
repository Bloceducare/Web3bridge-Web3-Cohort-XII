// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const AjoModule = buildModule("AjoModule", (m) => {
  
  const targetAmount = m.getParameter<bigint>("targetAmount", 5_000n * 10n ** 18n); 
  const withdrawalDate = m.getParameter<number>("withdrawalDate", Math.floor(Date.now() / 1000) + 604800); 
  const manager = m.getAccount(0); 

  const erc20Token = m.getParameter<string>("erc20Token", "0x5FbDB2315678afecb367f032d93F642f64180aa3");
  const erc721Token = m.getParameter<string>("erc721Token", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");

  const ajo = m.contract("AJO", [targetAmount, withdrawalDate, manager, erc20Token, erc721Token]);

  return { ajo };
});

export default AjoModule;

