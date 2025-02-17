import {
    loadFixture
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { expect } from "chai";
  import {ethers} from "hardhat";


describe("Swap", () => {
    async function deploySwapandTokenFixture() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const tokenAFactory = await ethers.getContractFactory("Token");
        const tokenBFactory = await ethers.getContractFactory("Token");

        const tokenA = await tokenAFactory.deploy("TokenA", "TKA");
        const tokenB = await tokenBFactory.deploy("TokenB", "TKB");

        const swapFactory = await ethers.getContractFactory("Swap")
        const swap = await swapFactory.deploy(tokenA.target, tokenB.target);

        return { swap, tokenA, tokenB, owner, addr1, addr2 };

    }

    describe("Deployment", ()=>{
        it("Should set the right tokens", async ()=>{
            const {swap, tokenA, tokenB} = await loadFixture(deploySwapandTokenFixture);
            expect(await swap.tokenA()).to.equal(tokenA.target);
            expect(await swap.tokenB()).to.equal(tokenB.target);
        });

        it("Should set the right tokens owner", async ()=>{
            const {tokenA, tokenB, owner} = await loadFixture(deploySwapandTokenFixture);
            expect(await tokenA.owner()).to.equal(owner.address);
            expect(await tokenB.owner()).to.equal(owner.address);
        });
    })
    describe("SWAP TOKENS", () => {
        it("Should swap tokens", async () => {
            const {swap, tokenA, tokenB, owner, addr1} = await loadFixture(deploySwapandTokenFixture);

            await tokenA.mint(swap.target, ethers.parseUnits("1000", 18));
            await tokenB.mint(swap.target, ethers.parseUnits("1000", 18));
            await tokenA.mint(addr1.address, ethers.parseUnits("500", 18));

            const balanceBeforeofTokenA = await tokenA.balanceOf(swap.target);
            const balanceBeforeofTokenB = await tokenB.balanceOf(swap.target);
            const address1tokenB = await tokenB.connect(addr1).balanceOf(addr1.address);
            const address1tokenA = await tokenA.connect(addr1).balanceOf(addr1.address);


            await tokenA.connect(addr1).approve(swap.target, ethers.parseUnits("100", 18));
            await swap.connect(addr1).swapToken(ethers.parseUnits("100", 18), tokenA.target);

            const balanceAfterofTokenA = await tokenA.balanceOf(swap.target);
            const balanceAfterofTokenB = await tokenB.balanceOf(swap.target);

            expect(balanceAfterofTokenA).to.equal(balanceBeforeofTokenA + ethers.parseUnits("100", 18));
            expect(balanceAfterofTokenB).to.be.lessThan(balanceBeforeofTokenB);
            expect(await tokenB.connect(addr1).balanceOf(addr1.address)).to.be.greaterThan(address1tokenB);
            expect(await tokenA.connect(addr1).balanceOf(addr1.address)).to.equal(address1tokenA - ethers.parseUnits("100", 18));


        })
    })
})
