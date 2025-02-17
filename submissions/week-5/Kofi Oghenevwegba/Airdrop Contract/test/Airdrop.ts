import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { expect } from "chai";
  import hre from "hardhat";
  import { ethers } from "hardhat";
  import { MerkleTree } from 'merkletreejs';
  import keccak256 from "keccak256";
  import helpers from "@nomicfoundation/hardhat-network-helpers";
  
  
  
  const DAI = "0x8cCC8EbFE07188e6A6Aa6AA84FC93027f861B0EA";
  const AIRDROP_CLAIMER = "0x71c330F475842B8dF1b7669E6636333cb26FF1aD";
  
  describe("Airdrop Claim", function () {
    async function deployAirdropClaim() {
      await helpers.impersonateAccount(AIRDROP_CLAIMER);
      const impersonatedClaimer = await ethers.getSigner(AIRDROP_CLAIMER);
  
      const [owner, otherAccount, otherAccount1, otherAccount2, otherAccount3, otherAccount4] = await hre.ethers.getSigners();

      const leafNodes = [ owner, otherAccount, otherAccount1, otherAccount2, otherAccount3, otherAccount4, impersonatedClaimer].map((addr) =>
        keccak256(ethers.solidityPacked(["address", "uint256"], [addr.address, ethers.parseUnits("1", 18)]))
      );
    
      const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
      // const rootHash = merkleTree.getHexRoot();
      const rootHash = "0x2386505d972f5a8e96f5ec1270b9ec22e399cc3655981edd7ee5bc8edf1d0744";
  
      const Airdrop = await hre.ethers.getContractFactory("MerkleAirdrop");
      const airdrop = await Airdrop.deploy(DAI, rootHash);
  
      return { airdrop, owner, AIRDROP_CLAIMER, merkleTree, impersonatedClaimer };
    }
  
    describe("Claim", function () {
      it("Should claim successfully", async function () {
        const { airdrop, impersonatedClaimer, } = await loadFixture(deployAirdropClaim);
        const TOKEN_HOLDER = "0xf584F8728B874a6a5c7A8d4d387C9aae9172D621";
        await helpers.setBalance(AIRDROP_CLAIMER, ethers.parseEther("1"));
  
        await helpers.impersonateAccount(TOKEN_HOLDER);
        const impersonatedSigner = await ethers.getSigner(TOKEN_HOLDER);
  
        const Trsfamount = ethers.parseUnits("2", 18);
        const Claimamount = ethers.parseUnits("1", 18);
  
        const DAI_Contract = await ethers.getContractAt("IERC20", DAI, impersonatedSigner);
  
        await DAI_Contract.transfer(airdrop, Trsfamount);
  
        const proof = [
          '0x479919b0ec677d1d5ff04bba6d7f7c5ae579db0523c321f74bb5c7ecb4b0bebf',
          '0xd9f6434e4a9834e8e0ccda9eae02cf63e04feeff96002323ee17ea7bb073569c',
          '0x540cfc25d77baa5129daef6cb11fb218340bc5d27b372cdd446b32485ab48c69',
          '0xff3a2998220cbc4c1e8d3bf250d11c1a36df2f19b7dd4607790937beff83647f'
        ];
        
  
        const claimTx = await airdrop.connect(impersonatedClaimer).claim(AIRDROP_CLAIMER, Claimamount, proof);
  
        claimTx.wait();
  
        expect(claimTx).to.emit(airdrop, "ClaimSuccessful").withArgs(AIRDROP_CLAIMER, Claimamount);
  
      });
    });
  });