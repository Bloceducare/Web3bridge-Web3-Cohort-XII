import {
    loadFixture
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import {ethers} from "hardhat";
import {expect} from "chai";
import {StandardMerkleTree} from "@openzeppelin/merkle-tree";


describe("Airdrop", ()=>{
    async function deployTokenandAirdropFixture() {
        const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
        const _tokenContract = await ethers.getContractFactory("LTK");
        const _tokenInstance = await _tokenContract.deploy();
      

        const addresses = [
            [addr1.address, ethers.parseEther("0.1").toString()], 
            [addr2.address, ethers.parseEther("0.1").toString()],
            [addr3.address, ethers.parseEther("0.1").toString()],
            [addr4.address, ethers.parseEther("0.1").toString()]
        ];

        const merkleTree = StandardMerkleTree.of(addresses, ["address", "uint256"]);

        const _root = merkleTree.root;

        const _airdropContract = await ethers.getContractFactory("Airdrop");
        const _airdropInstance = await _airdropContract.deploy(_root, _tokenInstance.target);


        return {_tokenInstance, _airdropInstance, owner, addr1, addr2, addr3, addr4, _root, merkleTree, addresses}
    }

    describe("deployment", () => {
        it("should deploy token contract", async () => {
            const {_tokenInstance, owner} = await loadFixture(deployTokenandAirdropFixture);
            expect(await _tokenInstance.symbol()).to.equal('cxii');
        });
        it("should deploy the Airdrop contract", async () => {
            const {_airdropInstance, owner, _root} = await loadFixture(deployTokenandAirdropFixture);
            expect(await _airdropInstance.merkleRoot()).to.equal(_root);
        })
    })
    describe("claim", () => {
        it("should claim if proof and amount is correct", async () => {
            const {_airdropInstance, addr1, _tokenInstance, merkleTree, addresses} = await loadFixture(deployTokenandAirdropFixture);
            let index = 0;
            for (let i = 0; i < addresses.length; i++) {
                if (addresses[i][0] === addr1.address) {
                    index = i;
                    break;
                }
            }


        const proof = merkleTree.getProof(index);
        const amount = ethers.parseEther("0.1");
        console.log(proof);

        await _airdropInstance.connect(addr1).claim(proof, amount);
        expect(await _tokenInstance.balanceOf(addr1.address)).to.equal(amount);
        });

        it("should not claim if proof is incorrect", async () => {
            const {_airdropInstance, addr1, addr2, _tokenInstance, merkleTree, addresses} = await loadFixture(deployTokenandAirdropFixture);
            let index = 0;
            for (let i = 0; i < addresses.length; i++) {
                if (addresses[i][0] === addr2.address) {
                    index = i;
                    break;
                }
            }

            const proof = merkleTree.getProof(index);
            const amount = ethers.parseEther("0.1");

            await expect(_airdropInstance.connect(addr1).claim(proof, amount)).to.be.revertedWithCustomError(_airdropInstance, "NOTWHITELISTED");
        });

        it("should update merkle root after claiming", async () => {
            const {_airdropInstance, addr1, _tokenInstance, merkleTree, addresses, _root} = await loadFixture(deployTokenandAirdropFixture);
            let index = 0;
            for (let i = 0; i < addresses.length; i++) {
                if (addresses[i][0] === addr1.address) {
                    index = i;
                    break;
                }
            }

            const proof = merkleTree.getProof(index);
            const amount = ethers.parseEther("0.1");

            await _airdropInstance.connect(addr1).claim(proof, amount);

            addresses.splice(index, 1);
            console.log(addresses.length);

            const newMerkeRoot = StandardMerkleTree.of(addresses, ["address", "uint256"]).root;
            await _airdropInstance.updateMerkleRoot(newMerkeRoot);
            expect(await _airdropInstance.merkleRoot()).to.not.equal(_root);
        })

        it("should not update merkle root if not owner", async () => {
            const {_airdropInstance, addr1, _tokenInstance, merkleTree, addresses, _root} = await loadFixture(deployTokenandAirdropFixture);
            let index = 0;
            for (let i = 0; i < addresses.length; i++) {
                if (addresses[i][0] === addr1.address) {
                    index = i;
                    break;
                }
            }

            const proof = merkleTree.getProof(index);
            const amount = ethers.parseEther("0.1");

            await _airdropInstance.connect(addr1).claim(proof, amount);

            addresses.splice(index, 1);
            console.log(addresses.length);

            const newMerkeRoot = StandardMerkleTree.of(addresses, ["address", "uint256"]).root;

            await expect(_airdropInstance.connect(addr1).updateMerkleRoot(newMerkeRoot)).to.be.reverted;
        });

          
    });
})