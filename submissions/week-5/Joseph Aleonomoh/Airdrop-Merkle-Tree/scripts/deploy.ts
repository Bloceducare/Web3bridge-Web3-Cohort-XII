import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { ethers } from "hardhat";

async function deployToken() {
    console.log('\n========Deploying Token Contract========');
    const signer = ethers.provider.getSigner();
    const _tokenContract = await ethers.deployContract("LTK");
    const receipt = await _tokenContract.waitForDeployment();

    console.log(`\nTOKEN DEPLOYED AT: ${_tokenContract.target}\n\n`);
    return _tokenContract;
}

async function deployAirdrop(_root, _tokenInstance) {
    console.log('\n========Deploying Airdrop Contract========\n');
    const signer = ethers.provider.getSigner();
    const _airdropContract = await ethers.deployContract("Airdrop", [_root, _tokenInstance.target]);
    const receipt = await _airdropContract.waitForDeployment();

    console.log(`Airdrop deployed at: ${_airdropContract.target}\n\n`);
    return _airdropContract;
}

async function main() {
    console.log('======Starting deployments (Token and Airdrop Contracts)======');
        const signer = await ethers.provider.getSigner();
        const [addr1, addr2, addr3, addr4] = [signer, signer, signer, signer];
        const addresses = [
            [addr1.address, ethers.parseEther("0.1").toString()],
            [addr2.address, ethers.parseEther("0.1").toString()],
            [addr3.address, ethers.parseEther("0.1").toString()],
            [addr4.address, ethers.parseEther("0.1").toString()]
        ];
    
        const _tokenInstance = await deployToken();

        console.log('======Generating Merkle Root======');
        const merkleTree = StandardMerkleTree.of(addresses, ["address", "uint256"]);
        const _root = merkleTree.root;
        console.log(`MERKLE ROOT: ${_root}\n\n`);
        const _airdropInstance = await deployAirdrop(_root, _tokenInstance);

        console.log('======Deployments completed======\n');
        console.log('Token Contract: ', _tokenInstance.target);
        console.log('Airdrop Contract: ', _airdropInstance.target);
        
    
}

main().then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });