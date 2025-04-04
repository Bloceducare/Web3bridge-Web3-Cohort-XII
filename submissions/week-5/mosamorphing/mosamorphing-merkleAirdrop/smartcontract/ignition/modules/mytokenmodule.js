const { buildModule } = require("@nomicfoundation/hardhat-ignition");

module.exports = buildModule("MyTokenModule", (m) => {
  const initialSupply = m.getParameter("initialSupply", 1000000); // 1M tokens

  const myToken = m.contract("MyToken", [initialSupply]);

  return { myToken };
});