const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");



module.exports = buildModule("ERC20Implementation", (m) => {

  // uint256 _totalSupply, string memory _tokenName, uint8 _decimal, string memory _tokenSymbol
  const totalSupply = ethers.parseUnits("1000000", 18);
  const tokenName = "PiggyERC20";
  const decimal = 18;
  const tokenSymbol = "PIGGY";

  const erc20 = m.contract("ERC20Implementation", [totalSupply, tokenName, decimal, tokenSymbol

  ]);

  return { erc20 };
});
