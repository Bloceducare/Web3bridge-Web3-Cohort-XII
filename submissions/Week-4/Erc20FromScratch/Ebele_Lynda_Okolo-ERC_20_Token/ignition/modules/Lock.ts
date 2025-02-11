import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const INITIAL_SUPPLY = 1000000;
const TOKEN_NAME = "My Token";
const TOKEN_SYMBOL = "MYT";
const TOKEN_DECIMALS = 18;

const ERC20Module = buildModule("ERC20Module", (m) => {
  const totalSupply = m.getParameter("totalSupply", INITIAL_SUPPLY);
  const name = m.getParameter("name", TOKEN_NAME);
  const symbol = m.getParameter("symbol", TOKEN_SYMBOL);
  const decimals = m.getParameter("decimals", TOKEN_DECIMALS);

  const erc20 = m.contract("MyToken", [totalSupply, name, symbol, decimals]);

  return { erc20 };
});

export default ERC20Module;