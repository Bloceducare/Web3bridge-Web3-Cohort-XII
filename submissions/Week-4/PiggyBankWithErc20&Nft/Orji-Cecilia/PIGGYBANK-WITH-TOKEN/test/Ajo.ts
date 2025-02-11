import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import hre from "hardhat";

describe("AJO Contract", function () {
    async function deployFixture() {
        const [owner, manager, user1, user2, nonManager] = await hre.ethers.getSigners();

        const ERC20Mock = await hre.ethers.getContractFactory("ERC20Mock");
        
        const erc20 = await ERC20Mock.deploy("CXII-Token", "CXII", hre.ethers.parseEther("100000"));

        console.log("ERC20 Address:", erc20.target);

        await erc20.waitForDeployment();

        const ERC721Mock = await hre.ethers.getContractFactory("ERC721Mock");
        const erc721 = await ERC721Mock.deploy("AjoNFT", "AJO", owner.address);

        console.log("ERC721 Address:", erc721.target); 
        
        await erc721.waitForDeployment();

        const latestBlock = await hre.ethers.provider.getBlock("latest");
        const withdrawalDate = (latestBlock?.timestamp || Math.floor(Date.now() / 1000)) + 86400;

        const AJO = await hre.ethers.getContractFactory("AJO");
        const ajo = await AJO.deploy(
            hre.ethers.parseEther("10"),
            withdrawalDate, 
            manager.address,
            erc20.target,
            erc721.target
        );
        await ajo.waitForDeployment();

        await erc721.setMinter(ajo.target);

        return { ajo, erc20, erc721, owner, manager, user1, user2, nonManager, withdrawalDate };
    }

    //Deposits test-cases
    describe("Deposits", function () {
        it("Should allow users to deposit", async function () {
            const { ajo, erc20, user1 } = await loadFixture(deployFixture);
            const depositAmount = hre.ethers.parseEther("5");

            await erc20.transfer(user1.address, depositAmount);
            await erc20.connect(user1).approve(ajo.target, depositAmount);

            await expect(ajo.connect(user1).save(depositAmount))
                .to.emit(ajo, "Contributed")
                .withArgs(user1.address, depositAmount, anyValue);

            expect(await ajo.contributions(user1.address)).to.equal(depositAmount);
        });

        it("Should reject deposits of zero amount", async function () {
            const { ajo, user1 } = await loadFixture(deployFixture);

            await expect(ajo.connect(user1).save(0)).to.be.revertedWith("Deposit amount must be greater than zero");
        });

        it("Should reject deposits when allowance is insufficient", async function () {
            const { ajo, erc20, user1 } = await loadFixture(deployFixture);
            const depositAmount = hre.ethers.parseEther("5");

            await erc20.transfer(user1.address, depositAmount);

            await expect(ajo.connect(user1).save(depositAmount)).to.be.revertedWith("Insufficient allowance");
        });

        it("Should reject deposits after the withdrawal date", async function () {
            const { ajo, user1 } = await loadFixture(deployFixture);

            await hre.ethers.provider.send("evm_increaseTime", [86400]);
            await hre.ethers.provider.send("evm_mine");

            await expect(ajo.connect(user1).save(hre.ethers.parseEther("5"))).to.be.revertedWith("You can no longer save");
        });
    });

    //Withdrawals test-cases
    describe("Withdrawals", function () {
        it("Should allow the manager to withdraw after the deadline", async function () {
            const { ajo, erc20, manager, user1, user2 } = await loadFixture(deployFixture);
            const depositAmount = hre.ethers.parseEther("5");

            await erc20.transfer(user1.address, depositAmount);
            await erc20.connect(user1).approve(ajo.target, depositAmount);
            await ajo.connect(user1).save(depositAmount);

            await erc20.transfer(user2.address, depositAmount);
            await erc20.connect(user2).approve(ajo.target, depositAmount);
            await ajo.connect(user2).save(depositAmount);

            await hre.ethers.provider.send("evm_increaseTime", [86400]);
            await hre.ethers.provider.send("evm_mine");

            await expect(ajo.connect(manager).withdrawal()).to.emit(ajo, "Withdrawn");
        });

        it("Should reject withdrawals if target amount is not met", async function () {
            const { ajo, manager } = await loadFixture(deployFixture);

            await hre.ethers.provider.send("evm_increaseTime", [86400]);
            await hre.ethers.provider.send("evm_mine");

            await expect(ajo.connect(manager).withdrawal()).to.be.revertedWith("Target amount not reached");
        });

        it("Should reject withdrawals from non-managers", async function () {
            const { ajo, nonManager } = await loadFixture(deployFixture);

            await expect(ajo.connect(nonManager).withdrawal()).to.be.revertedWith("Unauthorized: Only manager can perform this action");
        });

        it("Should reject withdrawals before the deadline", async function () {
            const { ajo, manager } = await loadFixture(deployFixture);

            await expect(ajo.connect(manager).withdrawal()).to.be.revertedWith("Not yet time for withdrawal");
        });
    });

    //NFT minting test-cases
    describe("NFT Minting", function () {
        it("Should mint an NFT after the second deposit", async function () {
            const { ajo, erc20, erc721, user1 } = await loadFixture(deployFixture);
            const depositAmount = hre.ethers.parseEther("5");

            await erc20.transfer(user1.address, depositAmount);
            await erc20.connect(user1).approve(ajo.target, depositAmount);
            await ajo.connect(user1).save(depositAmount);

            await erc20.transfer(user1.address, depositAmount);
            await erc20.connect(user1).approve(ajo.target, depositAmount);
            await ajo.connect(user1).save(depositAmount);

            expect(await ajo.isMinted(user1.address)).to.be.true;
            expect(await erc721.balanceOf(user1.address)).to.equal(1);
        });

        it("Should not mint an NFT if user has less than 2 deposits", async function () {
            const { ajo, erc20, user1 } = await loadFixture(deployFixture);
            const depositAmount = hre.ethers.parseEther("5");

            await erc20.transfer(user1.address, depositAmount);
            await erc20.connect(user1).approve(ajo.target, depositAmount);
            await ajo.connect(user1).save(depositAmount);

            expect(await ajo.isMinted(user1.address)).to.be.false;
        });

        it("Should not mint multiple NFTs to the same user", async function () {
            const { ajo, erc20, user1, erc721 } = await loadFixture(deployFixture);
            const depositAmount = hre.ethers.parseEther("5");

            await erc20.transfer(user1.address, depositAmount * 3n); 
            await erc20.connect(user1).approve(ajo.target, depositAmount * 3n);

            await ajo.connect(user1).save(depositAmount);
            await ajo.connect(user1).save(depositAmount);
            await ajo.connect(user1).save(depositAmount);

            expect(await erc721.balanceOf(user1.address)).to.equal(1);
        });
    });
});
