const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MultiSigBoard", function () {
    let multiSigBoard, owner, boardMembers, recipient;
    const MAX_BOARD_MEMBERS = 20;

    before(async function () {
        const signers = await ethers.getSigners();
        owner = signers[0];
        boardMembers = signers.slice(1, Math.min(MAX_BOARD_MEMBERS + 1, signers.length - 1));
        recipient = signers[Math.min(boardMembers.length + 1, signers.length - 1)];

        // Ensure there are enough signers
        if (boardMembers.length === 0 || !recipient) {
            throw new Error("Not enough signers available for testing.");
        }

        const MultiSigBoard = await ethers.getContractFactory("MultiSigBoard");
        multiSigBoard = await MultiSigBoard.deploy();
        await multiSigBoard.waitForDeployment();

        for (let i = 0; i < boardMembers.length; i++) {
            await multiSigBoard.addBoardMember(boardMembers[i].address);
        }
    });

    it("Should deposit ETH into the contract", async function () {
        const depositAmount = ethers.parseEther("10");
        await expect(
            boardMembers[0].sendTransaction({
                to: await multiSigBoard.getAddress(),
                value: depositAmount
            })
        ).to.changeEtherBalance(multiSigBoard, depositAmount);
    });

    it("Should allow board members to sign a transaction", async function () {
        const txHash = ethers.keccak256(ethers.toUtf8Bytes("testTx"));
        await expect(multiSigBoard.connect(boardMembers[0]).signTransaction(txHash))
            .to.emit(multiSigBoard, "Signed")
            .withArgs(boardMembers[0].address, txHash);
    });

    it("Should reject execution without enough signatures", async function () {
        const txHash = ethers.keccak256(ethers.toUtf8Bytes("withdrawTx"));
        await expect(
            multiSigBoard.connect(boardMembers[0]).executeWithdrawal(recipient.address, ethers.parseEther("1"), txHash)
        ).to.be.revertedWithCustomError(multiSigBoard, "NotEnoughSignatures");
    });

    it("Should allow withdrawal after all board members sign", async function () {
        const txHash = ethers.keccak256(ethers.toUtf8Bytes("withdrawTx"));
        const amount = ethers.parseEther("1");

        // Ensure all board members sign
        for (let i = 0; i < boardMembers.length; i++) {
            await multiSigBoard.connect(boardMembers[i]).signTransaction(txHash);
        }

        await expect(
            multiSigBoard.connect(boardMembers[0]).executeWithdrawal(recipient.address, amount, txHash)
        ).to.changeEtherBalance(recipient, amount);
    });

    it("Should allow adding and removing board members", async function () {
        const newMember = recipient;
        await expect(multiSigBoard.addBoardMember(newMember.address))
            .to.emit(multiSigBoard, "BoardMemberAdded")
            .withArgs(newMember.address);

        await expect(multiSigBoard.removeBoardMember(newMember.address))
            .to.emit(multiSigBoard, "BoardMemberRemoved")
            .withArgs(newMember.address);
    });
});
