import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const AirdropModule = buildModule("AirdropModule", (m) => {
  // Get parameters for token name and symbol
  const tokenName = m.getParameter("tokenName", "Hola Airdrop");
  const tokenSymbol = m.getParameter("tokenSymbol", "HOAI");

  // Deploy AirdropToken
  const airdropToken = m.contract("AirdropToken", [tokenName, tokenSymbol]);

  // Deploy Airdrop, passing the AirdropToken address
  const airdrop = m.contract("Airdrop", [airdropToken]);

  // Transfer tokens to the Airdrop contract
  const transferAmount = m.getParameter("transferAmount", "10000");
  m.call(airdropToken, "transfer", [airdrop, transferAmount]);

  return { airdropToken, airdrop };
});

export default AirdropModule;