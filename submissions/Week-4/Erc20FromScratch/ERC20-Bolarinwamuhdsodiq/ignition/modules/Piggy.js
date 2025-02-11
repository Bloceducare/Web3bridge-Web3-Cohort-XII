const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");



module.exports = buildModule("PiggyBankMine", (m) => {

  // uint256 _totalSupply, string memory _tokenName, uint8 _decimal, string memory _tokenSymbol
  

  const piggy = m.contract("PiggyBankMine");

  return { piggy };
});
