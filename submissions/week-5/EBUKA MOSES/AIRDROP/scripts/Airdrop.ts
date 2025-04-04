import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { ethers } from "hardhat";

async function deployToken() {
    console.log('\nDeploying token contract...');
    const signer = ethers.provider.getSigner();
    const _tokenContract = await ethers.deployContract("Token");
    const receipt = await _tokenContract.waitForDeployment();

    console.log(`Token deployed at: ${ _tokenContract.target }`);
    return _tokenContract;
}

async function deployAirdrop(_root, _tokenInstance) {
    console.log('\nDeploying airdrop contract...');
    const signer = ethers.provider.getSigner();
    const _airdropContract = await ethers.deployContract("Airdrop", [_root, _tokenInstance.target]);
    const receipt = await _airdropContract.waitForDeployment();

    console.log(`Airdrop deployed at: ${ _airdropContract.target }`);
    return _airdropContract;
}
 
async function claimAirdrop(address, _airdropInstance, _tokenInstance, addresses, merkleTree) {
    console.log(`\nProcessing airdrop claim for ${ address }...`);
    const signer = ethers.provider.getSigner();

    let index = 0;
    for (let i = 0; i < addresses.length; i++) {
        if (addresses[i][0] === address) {
            index = i;
            break;
        }
    }

    const proof = await merkleTree.getProof(index);
    const amount = ethers.parseEther("0.1");

    await _airdropInstance.claim(proof, amount);
    const balance = await _tokenInstance.balanceOf(address);
    console.log(`Claim successful.New balance: ${ ethers.formatEther(balance) } tokens`);
    return balance;
}

async function updateMerkleRoot(_airdropInstance, newRoot) {
    console.log('\nUpdating Merkle root...');
    const signer = ethers.provider.getSigner();
    await _airdropInstance.connect(signer).updateMerkleRoot(newRoot);
    console.log(`Merkle root updated to ${ newRoot }`);
}

async function generateMerkleRoot(addresses) {
    console.log('\nGenerating Merkle root...');
    const merkleTree = StandardMerkleTree.of(addresses, ["address", "uint256"]);
    const _root = merkleTree.root;
    console.log(`Merkle root generated: ${ merkleTree.root }`);
    return { _root, merkleTree };
}

async function main() {
    console.log('Starting deployment and airdrop process...');
    const signer = await ethers.provider.getSigner();
    const [addr1, addr2, addr3, addr4] = [signer, signer, signer, signer];
    const addresses = [
        [addr1.address, ethers.parseEther("0.1").toString()],
        [addr2.address, ethers.parseEther("0.1").toString()],
        [addr3.address, ethers.parseEther("0.1").toString()],
        [addr4.address, ethers.parseEther("0.1").toString()]
    ];

    const _tokenInstance = await deployToken();
    const { _root, merkleTree } = await generateMerkleRoot(addresses);
    const _airdropInstance = await deployAirdrop(_root, _tokenInstance);

    await claimAirdrop(addr1.address, _airdropInstance, _tokenInstance, addresses, merkleTree);

    console.log('\nDeployment and claims completed successfully');
}

main().catch((error) => {
    console.error('\nError:', error);
    process.exit(1);
});