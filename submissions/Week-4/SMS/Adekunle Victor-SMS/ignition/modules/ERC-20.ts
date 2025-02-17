import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ERC20Module = buildModule("ERC20Module", (m) => {
  const name = "MyToken"; // Set your token name
  const symbol = "MTK";   // Set your token symbol

  const erc20 = m.contract("ERC20", [name, symbol]); // Pass arguments

  return { erc20 };
});

export default ERC20Module;
