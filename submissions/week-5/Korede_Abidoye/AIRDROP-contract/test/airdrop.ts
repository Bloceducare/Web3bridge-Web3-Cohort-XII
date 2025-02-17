import { expect } from "chai";
import { ethers } from "hardhat";
import { generateMerkleTree } from "../scripts/generatemerkle";

describe("Airdrop", function () {
  it("Should deploy and claim successfully", async function () {
    const [owner, addr1] = await ethers.getSigners();

    // Deploy token
    const Token = await ethers.getContractFactory("AirdropToken");
    const token = await Token.deploy();
    await token.waitForDeployment();

    // Deploy airdrop
    const Airdrop = await ethers.getContractFactory("AirdropMerkle");
    const airdrop = await Airdrop.deploy(await token.getAddress());
    await airdrop.waitForDeployment();

    // Generate whitelist
    const whitelist = [
      {
        address: await addr1.getAddress(),
        amount: ethers.parseUnits("0.0000000001", 18).toString()
      }
    ];

    // Generate Merkle tree
    const { root, proofs } = generateMerkleTree(whitelist);

    // Initialize airdrop
    await token.transfer(await airdrop.getAddress(), whitelist[0].amount);
    await airdrop.initializeAirdrop(
      root,
      [whitelist[0].address],
      [whitelist[0].amount]
    );

    // Claim
    const proof = proofs[await addr1.getAddress()];
    await airdrop.connect(addr1).claim(
      await addr1.getAddress(),
      proof.amount,
      proof.proof
    );

    // Verify balance
    expect(await token.balanceOf(await addr1.getAddress())).to.equal(
      proof.amount
    );
  });
});
