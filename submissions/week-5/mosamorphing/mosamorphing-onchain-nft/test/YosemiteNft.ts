import { expect } from "chai";
import { ethers } from "hardhat";
import { YosemiteNft } from "../typechain-types";

describe("YosemiteNft", function () {
  let yosemiteNft: YosemiteNft;
  let owner: any, addr1: any;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const YosemiteNftFactory = await ethers.getContractFactory("YosemiteNft");
    yosemiteNft = (await YosemiteNftFactory.deploy()) as YosemiteNft;
  });

  it("should deploy with the correct name and symbol", async function () {
    expect(await yosemiteNft.name()).to.equal("YosemiteNft");
    expect(await yosemiteNft.symbol()).to.equal("YNFT");
  });

  it("should allow minting an NFT", async function () {
    await expect(yosemiteNft.mint())
    .to.emit(yosemiteNft, "Transfer")
    .withArgs(ethers.ZeroAddress, owner.address, 0);

    expect(await yosemiteNft.ownerOf(0)).to.equal(owner.address);
  });

  it("should return correct tokenURI for tokenId 0", async function () {
    await yosemiteNft.mint();
    const tokenURI = await yosemiteNft.tokenURI(0);
    expect(tokenURI).to.include("data:application/json;base64,");
  });

  it("should fail to return tokenURI for non-existent token", async function () {
    await expect(yosemiteNft.tokenURI(1)).to.be.revertedWith("Token ID does not exist");
  });
});
