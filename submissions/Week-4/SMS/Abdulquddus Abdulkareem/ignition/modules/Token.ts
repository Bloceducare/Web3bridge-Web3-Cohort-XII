// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const TokenkModule = buildModule("token", (m) => {
     const name = m.getParameter("name", "Slimany");
     const symbol = m.getParameter("symbol", "SLM");
     // const decimals = m.getParameter("decimals", 18);
     const tokenSupply = m.getParameter("tokenAmount", 6420);

  const Token = m.contract("ERC20", [name, symbol, tokenSupply]);

  return { Token };
});

export default TokenkModule;
