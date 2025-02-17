const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Airdrop", function () {
    let owner, addr1, addr2, addr3, nonWhitelisted;
    let token, airdrop;
    
    beforeEach(async function () {
        // Get signers
        [owner, addr1, addr2, addr3, nonWhitelisted] = await ethers.getSigners();

        // Deploy Mock ERC20 Token
        const Token = await ethers.getContractFactory("Tanab");
        token = await Token.deploy(owner.address, owner.address);
        await token.waitForDeployment();

        // Deploy Airdrop Contract
        const Airdrop = await ethers.getContractFactory("Airdrop");
        airdrop = await Airdrop.deploy(await token.getAddress());
        await airdrop.waitForDeployment();

        
        await token.transfer(await airdrop.getAddress(), ethers.parseEther("10000"));

        // Approve the Airdrop contract to spend owner's tokens
        await token.approve(await airdrop.getAddress(), ethers.parseEther("10000"));
    });

    it("Should allow owner to whitelist addresses", async function () {
        await expect(airdrop.setWhitelist(addr1.address, true))
            .to.emit(airdrop, "Whitelisted")
            .withArgs(addr1.address, true);

        expect(await airdrop.whitelisted(addr1.address)).to.equal(true);
    });

    it("Should airdrop tokens to a whitelisted address", async function () {
        await airdrop.setWhitelist(addr1.address, true);

        await expect(airdrop.airdrop(addr1.address, ethers.parseEther("100")))
            .to.emit(airdrop, "AirdropSent")
            .withArgs(addr1.address, ethers.parseEther("100"));

        expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseEther("100"));
    });

    it("Should fail if recipient is not whitelisted", async function () {
        await expect(
            airdrop.airdrop(addr1.address, ethers.parseEther("100"))
        ).to.be.revertedWithCustomError(airdrop, "NotWhitelisted");
    });


    it("Should batch airdrop to multiple whitelisted addresses", async function () {
        await airdrop.setWhitelist(addr1.address, true);
        await airdrop.setWhitelist(addr2.address, true);
        await airdrop.setWhitelist(addr3.address, true);

        const recipients = [addr1.address, addr2.address, addr3.address];
        const amounts = [ethers.parseEther("50"), ethers.parseEther("75"), ethers.parseEther("25")];

        await expect(airdrop.batchAirdrop(recipients, amounts))
            .to.emit(airdrop, "AirdropSent")
            .withArgs(addr1.address, ethers.parseEther("50"))
            .to.emit(airdrop, "AirdropSent")
            .withArgs(addr2.address, ethers.parseEther("75"))
            .to.emit(airdrop, "AirdropSent")
            .withArgs(addr3.address, ethers.parseEther("25"));

        expect(await token.balanceOf(addr1.address)).to.equal(ethers.parseEther("50"));
        expect(await token.balanceOf(addr2.address)).to.equal(ethers.parseEther("75"));
        expect(await token.balanceOf(addr3.address)).to.equal(ethers.parseEther("25"));
    });

    it("Should fail batch airdrop if arrays are mismatched", async function () {
        await airdrop.setWhitelist(addr1.address, true);
        await airdrop.setWhitelist(addr2.address, true);

        const recipients = [addr1.address, addr2.address];
        const amounts = [ethers.parseEther("50")]; // Only one amount

        await expect(airdrop.batchAirdrop(recipients, amounts)).to.be.revertedWith("Mismatched arrays");
    });

    it("Should fail batch airdrop if recipient is not whitelisted", async function () {
        await airdrop.setWhitelist(addr1.address, true);

        const recipients = [addr1.address, nonWhitelisted.address];
        const amounts = [ethers.parseEther("50"), ethers.parseEther("75")];

        await expect(airdrop.batchAirdrop(recipients, amounts)).to.be.revertedWithCustomError(airdrop, "NotWhitelisted");
    });
});
