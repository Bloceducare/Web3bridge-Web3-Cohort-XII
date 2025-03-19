// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const PiggyBankNFTModule = buildModule("PiggyBankNFTModule", (m) => {

  const name = "MAY NFT CONTRACT";
  const symbol = "MTK-NFT";
  const nft = m.contract("PiggyBankNFT", [name, symbol]);

  return { nft };
});

export default PiggyBankNFTModule;