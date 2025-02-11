// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const OurPiggyBankModule = buildModule("OurPiggyBankModule", (m) => {

  const name = "Cohort XII NFT";
  const symbol = "CXII-NFT";
  const ourPiggyBank = m.contract("OurERC721", [name, symbol]);

  return { ourPiggyBank };
});

export default OurPiggyBankModule;