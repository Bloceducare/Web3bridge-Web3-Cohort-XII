import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";

  import {expect} from "chai";
  import hre from "hardhat";

  describe("ERC20 TOKEN ", () => {
    async function deployERC20TOKEN() {
        const tokenName  = "Abstract"
        const symbol = "ABS"
        
        const [owner, account1, account2] = await hre.ethers.getSigners()
        const ERC20 = await hre.ethers.getContractFactory("OurERC20")
        const erc20 = await ERC20.deploy(tokenName, symbol)
        return {erc20, tokenName, symbol, owner};
    }

    describe("Deployment", () => {

        it("should deploy and set the initial values", async () => {
            const {tokenName, symbol, erc20} = await loadFixture(deployERC20TOKEN);

            expect(await erc20.name()).to.equal(tokenName);

            expect(await erc20.symbol()).to.equal(symbol);

        })

    })
  })