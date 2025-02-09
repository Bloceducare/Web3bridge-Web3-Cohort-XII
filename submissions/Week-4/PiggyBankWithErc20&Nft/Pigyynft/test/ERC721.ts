import { expect } from "chai";
import { ethers } from "hardhat";
import { OurERC721 } from "../typechain-types";

describe("OurERC721 NFT Contract", function () {
  let nft: OurERC721;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy OurERC721
    const NFT = await ethers.getContractFactory("OurERC721");
    nft = await NFT.deploy("OurNFT", "ONFT");
    await nft.waitForDeployment();
  });

  it("Should deploy with correct name and symbol", async function () {
    expect(await nft.name()).to.equal("OurNFT");
    expect(await nft.symbol()).to.equal("ONFT");
  });

  it("Should mint an NFT to the contract owner on deployment", async function () {
    expect(await nft.ownerOf(1)).to.equal(owner.address);
  });

  it("Should allow the owner to mint new NFTs", async function () {
    await nft.mint(addr1.address);
    expect(await nft.ownerOf(2)).to.equal(addr1.address);
  });

  it("Should not allow non-owner to mint NFTs", async function () {
    await expect(nft.connect(addr1).mint(addr2.address)).to.be.reverted;
  });

  it("Should track the total number of minted NFTs correctly", async function () {
    await nft.mint(addr1.address);
    await nft.mint(addr2.address);

    expect(await nft.ownerOf(2)).to.equal(addr1.address);
    expect(await nft.ownerOf(3)).to.equal(addr2.address);
  });
});
