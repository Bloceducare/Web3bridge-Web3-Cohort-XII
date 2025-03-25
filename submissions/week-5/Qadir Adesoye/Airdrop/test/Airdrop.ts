import { expect } from "chai";
import { ethers } from "hardhat";
import { AirdropToken, Airdrop } from "../typechain-types";

describe("Airdrop System", function () {
    let token: AirdropToken;
    let airdrop: Airdrop;
    let owner: any;
    let user1: any;
    let user2: any;
    let nonWhitelisted: any;

    const WHITELIST_ADDR1 = "0x1234567890123456789012345678901234567890";
    const WHITELIST_ADDR2 = "0x0987654321098765432109876543210987654321";

    beforeEach(async function () {
        [owner, user1, user2, nonWhitelisted] = await ethers.getSigners();

        // Deploy Token
        const Token = await ethers.getContractFactory("AirdropToken");
        token = await Token.deploy();
        await token.waitForDeployment();

        // Deploy Airdrop
        const Airdrop = await ethers.getContractFactory("Airdrop");
        airdrop = await Airdrop.deploy(await token.getAddress());
        await airdrop.waitForDeployment();

        // Transfer tokens to airdrop contract
        await token.transfer(await airdrop.getAddress(), ethers.parseEther("10000"));
    });

    describe("Deployment", function () {
        it("Should deploy token contract correctly", async function () {
            expect(await token.name()).to.equal("HOLA Airdrop");
            expect(await token.symbol()).to.equal("HAT");
            expect(await token.totalSupply()).to.equal(ethers.parseEther("1000000"));
        });

        it("Should deploy airdrop contract correctly", async function () {
            expect(await airdrop.token()).to.equal(await token.getAddress());
            expect(await airdrop.rewardAmount()).to.equal(ethers.parseEther("100"));
        });
    });

    describe("addToWhitelist", function () {
        it("Should allow owner to add addresses to whitelist", async function () {
            await airdrop.addToWhitelist([WHITELIST_ADDR1, WHITELIST_ADDR2]);
            expect(await airdrop.whitelist(WHITELIST_ADDR1)).to.be.true;
            expect(await airdrop.whitelist(WHITELIST_ADDR2)).to.be.true;
        });

        it("Should emit Whitelisted event", async function () {
            await expect(airdrop.addToWhitelist([WHITELIST_ADDR1]))
                .to.emit(airdrop, "Whitelisted")
                .withArgs(WHITELIST_ADDR1);
        });

        it("Should revert if non-owner tries to add to whitelist", async function () {
            await expect(
                airdrop.connect(user1).addToWhitelist([WHITELIST_ADDR1])
            ).to.be.revertedWithCustomError(airdrop, "OwnableUnauthorizedAccount")
             .withArgs(user1.address);
        });
    });

    describe("completeTask", function () {
        it("Should allow users to complete tasks", async function () {
            await airdrop.connect(user1).completeTask(1);
            expect(await airdrop.taskCompletions(user1.address)).to.equal(1);
        });

        it("Should revert for invalid task ID", async function () {
            await expect(
                airdrop.connect(user1).completeTask(0)
            ).to.be.revertedWith("Invalid task ID");
            
            await expect(
                airdrop.connect(user1).completeTask(4)
            ).to.be.revertedWith("Invalid task ID");
        });

        it("Should emit TaskCompleted event", async function () {
            await expect(airdrop.connect(user1).completeTask(1))
                .to.emit(airdrop, "TaskCompleted")
                .withArgs(user1.address, 1);
        });
    });

    describe("claimAirdrop", function () {
        it("Should allow whitelisted users to claim", async function () {
            await airdrop.addToWhitelist([user1.address]);
            await airdrop.connect(user1).claimAirdrop();
            
            expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther("100"));
            expect(await airdrop.hasClaimed(user1.address)).to.be.true;
        });

        it("Should allow users with completed tasks to claim", async function () {
            await airdrop.connect(user1).completeTask(1);
            await airdrop.connect(user1).completeTask(2);
            await airdrop.connect(user1).completeTask(3);
            
            await airdrop.connect(user1).claimAirdrop();
            expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther("100"));
        });

        it("Should revert for non-eligible users", async function () {
            await expect(
                airdrop.connect(nonWhitelisted).claimAirdrop()
            ).to.be.revertedWith("Not eligible for airdrop");
        });

        it("Should revert for double claiming", async function () {
            await airdrop.addToWhitelist([user1.address]);
            await airdrop.connect(user1).claimAirdrop();
            
            await expect(
                airdrop.connect(user1).claimAirdrop()
            ).to.be.revertedWith("Already claimed");
        });

        it("Should emit AirdropClaimed event", async function () {
            await airdrop.addToWhitelist([user1.address]);
            await expect(airdrop.connect(user1).claimAirdrop())
                .to.emit(airdrop, "AirdropClaimed")
                .withArgs(user1.address, ethers.parseEther("100"));
        });
    });

    describe("checkBalance", function () {
        it("Should return correct balance for any address", async function () {
            await airdrop.addToWhitelist([user1.address]);
            await airdrop.connect(user1).claimAirdrop();
            
            const balance = await airdrop.checkBalance(user1.address);
            expect(balance).to.equal(ethers.parseEther("100"));
        });

        it("Should return zero for addresses with no tokens", async function () {
            const balance = await airdrop.checkBalance(user2.address);
            expect(balance).to.equal(0);
        });
    });

    describe("withdrawTokens", function () {
        it("Should allow owner to withdraw tokens", async function () {
            const initialBalance = await token.balanceOf(owner.address);
            await airdrop.withdrawTokens(ethers.parseEther("1000"));
            
            const finalBalance = await token.balanceOf(owner.address);
            expect(finalBalance).to.equal(initialBalance + ethers.parseEther("1000"));
        });

        it("Should revert if non-owner tries to withdraw", async function () {
            await expect(
                airdrop.connect(user1).withdrawTokens(ethers.parseEther("1000"))
            ).to.be.revertedWithCustomError(airdrop, "OwnableUnauthorizedAccount")
             .withArgs(user1.address);
        });
    });

    describe("setRewardAmount", function () {
        it("Should allow owner to set new reward amount", async function () {
            await airdrop.setRewardAmount(ethers.parseEther("200"));
            expect(await airdrop.rewardAmount()).to.equal(ethers.parseEther("200"));
        });

        it("Should revert if non-owner tries to set reward", async function () {
            await expect(
                airdrop.connect(user1).setRewardAmount(ethers.parseEther("200"))
            ).to.be.revertedWithCustomError(airdrop, "OwnableUnauthorizedAccount")
             .withArgs(user1.address);
        });
    });
});