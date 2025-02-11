// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract OurERC721 is ERC721, Ownable {
    uint256 private nft_id;

    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) Ownable(msg.sender) {
        nft_id += 1;
        _mint(msg.sender, nft_id);
    }

    // function _baseURI() internal view virtual override returns (string memory) {
    //     return "https://gateway.pinata.cloud/ipfs/bafkreiadfwfkrt2zz6ah2onhpcv6b3slm3346wgpwrnvhx3nfn3cpdzmti";
    // }

    function mint(address _to) public {
        nft_id += 1;
        _mint(_to, nft_id);
    }
}




// import {
//   time,
//   loadFixture,
// } from "@nomicfoundation/hardhat-toolbox/network-helpers";
// import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
// import { expect } from "chai";
// import hre from "hardhat";

// describe ("OurERC20", function(){
//   async function deployyOurERC20Fixture(){
//     const [owner, addr1] = await hre.ethers.getSigners();
//     const OurERC20 = await hre.ethers.getContractFactory("OurERC20")
//     const Ourerc20 = await OurERC20.deploy("Samuel", "LTK");
//     return {Ourerc20, owner, addr1};
//   }

//   describe("Deployment", function(){
//     it("Should deploy OurERC20 contract", async function(){
//       const {Ourerc20, owner} = await loadFixture(deployyOurERC20Fixture);
//       expect(await Ourerc20.name()).to.equal("Samuel");

//     })
//   })
//    describe("Mint", function(){
//     it("Should mint tokens", async function(){
//       const {Ourerc20, owner} = await loadFixture(deployyOurERC20Fixture);
//       await Ourerc20.mint(owner)
//     })
//    })
// })

  