import {
    loadFixture
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { expect } from "chai";
  import {ethers} from "hardhat";
import { extendConfig } from "hardhat/config";


  describe("MultiSig", () => {
    async function deployFixture() {
        const signers = await ethers.getSigners();
     
        const boardMembers = signers.slice(0, 20);
        const nonBoardMember = signers[20];

        const addresses = boardMembers.map(signer => signer.address);
        const uniqueAddresses = new Set(addresses);
      
        const tokenFactory = await ethers.getContractFactory("Token");
        const token = await tokenFactory.deploy("Leo", "LTK");

        const multiSigFactory = await ethers.getContractFactory("MultiSig");
        const multiSig = await multiSigFactory.deploy(
            addresses,
            await token.getAddress()
        );

        return { token, multiSig, boardMembers, nonBoardMember };
    }

    describe("Constructor", () => {
        it("Should revert if board members length is not 20", async () => {
            const signers = await ethers.getSigners();
            const tokenFactory = await ethers.getContractFactory("Token");
            const token = await tokenFactory.deploy("Leo", "LTK");
            const multiSigFactory = await ethers.getContractFactory("MultiSig");

            await expect(multiSigFactory.deploy(
                signers.slice(0, 19).map(signer => signer.address),
                await token.getAddress()
            )).to.be.revertedWithCustomError(multiSigFactory, "IncompleteBoardMembers");
        });

        it("Should set board members correctly", async () => {
            const { multiSig, boardMembers } = await loadFixture(deployFixture);
            
            for (const member of boardMembers) {
                expect(await multiSig.isBoardMember(member.address)).to.be.true;
            }
        });
    });

    describe("Transaction Initiation", () => {
        it("Should allow board member to initiate transaction", async () => {
            const { multiSig, boardMembers } = await loadFixture(deployFixture);
            const destination = ethers.Wallet.createRandom().address;
            const amount = ethers.parseEther("1");

            await expect(multiSig.connect(boardMembers[0]).initiateTransaction(destination, amount))
                .to.emit(multiSig, "TransactionEvent");
        });

        it("Should increment nonce for each transaction", async () => {
            const { multiSig, boardMembers } = await loadFixture(deployFixture);
            const destination = ethers.Wallet.createRandom().address;
            const amount = ethers.parseEther("1");

            await multiSig.connect(boardMembers[0]).initiateTransaction(destination, amount);
            expect(await multiSig.nonce()).to.equal(1);
        });
    });

    describe("Transaction Signing", () => {
        it("Should allow board members to sign transaction", async () => {
            const { multiSig, boardMembers } = await loadFixture(deployFixture);
            const destination = ethers.Wallet.createRandom().address;
            const amount = ethers.parseEther("1");

            await multiSig.connect(boardMembers[0]).initiateTransaction(destination, amount);
            const signersCount = (await multiSig.connect(boardMembers[1]).transactions(0)).signatureCount;
            await multiSig.connect(boardMembers[1]).signTransaction(0);

            expect((await multiSig.connect(boardMembers[1]).transactions(0)).signatureCount).to.equal(signersCount+BigInt(1));
        });

        it("Should revert if transaction already signed by member", async () => {
            const { multiSig, boardMembers } = await loadFixture(deployFixture);
            const destination = ethers.Wallet.createRandom().address;
            const amount = ethers.parseEther("1");

            await multiSig.connect(boardMembers[0]).initiateTransaction(destination, amount);
            await multiSig.connect(boardMembers[1]).signTransaction(0);
            
            await expect(multiSig.connect(boardMembers[1]).signTransaction(0))
                .to.be.revertedWithCustomError(multiSig, "AlreadySigned");
        });

        it("should revert if transaction already executed", async () => {
            const { multiSig, boardMembers, token } = await loadFixture(deployFixture);
            const destination = ethers.Wallet.createRandom().address;
            const amount = ethers.parseEther("1");
            await token.mint(multiSig.target, amount);

            await multiSig.connect(boardMembers[0]).initiateTransaction(destination, amount);
            for (let i = 0; i < 20; i++) {
                await multiSig.connect(boardMembers[i]).signTransaction(0);
            }

            await expect(multiSig.connect(boardMembers[0]).signTransaction(0))
                .to.be.reverted;
        });
        it("Should revert if non-board member tries to sign transaction", async () => {
            const { multiSig, boardMembers, nonBoardMember } = await loadFixture(deployFixture);
            const destination = ethers.Wallet.createRandom().address;
            const amount = ethers.parseEther("1");

            await multiSig.connect(boardMembers[0]).initiateTransaction(destination, amount);
            
            await expect(multiSig.connect(nonBoardMember).signTransaction(0))
                .to.be.reverted;
        });
    });

    describe("Liquidity", () => {
        it("Should allow adding liquidity", async () => {
            const { multiSig, token, boardMembers } = await loadFixture(deployFixture);
            const amount = ethers.parseEther("100");
            const balanceOfBefore = await token.balanceOf(multiSig.target)

            await token.mint(boardMembers[0].address, amount);
            await token.connect(boardMembers[0]).approve(await multiSig.getAddress(), amount);

            await multiSig.connect(boardMembers[0]).addLiquidity(amount);

            expect(await token.balanceOf(multiSig.target)).to.be.greaterThan(balanceOfBefore);
        });

        it("Should revert if insufficient allowance", async () => {
            const { multiSig, token, boardMembers } = await loadFixture(deployFixture);
            const amount = ethers.parseEther("50");
            const balanceOfBefore = await token.balanceOf(multiSig.target)
            const amountToUse = ethers.parseEther("100");
            await token.mint(boardMembers[0].address, amountToUse);
            await token.connect(boardMembers[0]).approve(await multiSig.getAddress(), amount);


            await expect(multiSig.connect(boardMembers[0]).addLiquidity(amountToUse))
                .to.be.revertedWithCustomError(multiSig, "InsufficientAllowance");
        });
    });

    describe("Transaction Execution", () => {
        it("Should execute transaction when threshold signatures reached", async () => {
            const { multiSig, token, boardMembers, nonBoardMember } = await loadFixture(deployFixture);
            const amount = ethers.parseEther("100");
            const destination = nonBoardMember.address;

            await token.mint(boardMembers[0].address, amount);
            await token.connect(boardMembers[0]).approve(await multiSig.getAddress(), amount);
            await multiSig.connect(boardMembers[0]).addLiquidity(amount);


            await multiSig.connect(boardMembers[0]).initiateTransaction(destination, amount);
            
            for (let i = 0; i < 20; i++) {
                await multiSig.connect(boardMembers[i]).signTransaction(0);
            }


            expect(await token.balanceOf(destination)).to.equal(amount);
        });
    });
});