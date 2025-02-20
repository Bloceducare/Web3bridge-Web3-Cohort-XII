import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { ethers } from "hardhat";

async function deployToken() {
    console.log('\n========Deploying Token Contract========');
    const signer = ethers.provider.getSigner();
    const _tokenContract = await ethers.deployContract("LTK");
    const receipt = await _tokenContract.waitForDeployment();

    console.log(`\nTOKEN DEPLOYED AT: ${_tokenContract.target}`);
    return _tokenContract;
}

async function deployAirdrop(_root, _tokenInstance) {
    console.log('\n========Deploying Airdrop Contract========');
    const signer = ethers.provider.getSigner();
    const _airdropContract = await ethers.deployContract("Airdrop", [_root, _tokenInstance.target]);
    const receipt = await _airdropContract.waitForDeployment();

    console.log(`Airdrop deployed at: ${_airdropContract.target}`);
    return _airdropContract;
}

async function claimAirdrop(address, _airdropInstance, _tokenInstance, addresses, merkleTree) {
    console.log(`\nPROCESSING AIRDROP CLAIM FOR USER #${address}...`);
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
    console.log("\n\n======CLAIM SUCCESSFUL======");
    console.log(`NEW BALANCE: ${ethers.formatEther(balance)} tokens`);
    return balance;
}

async function updateMerkleRoot(_airdropInstance, newRoot) {
    console.log('\n========Updating Merkle Root========');
    const signer = ethers.provider.getSigner();
    await _airdropInstance.connect(signer).updateMerkleRoot(newRoot);
    console.log(`MERKLE ROOT!! is updated to ${newRoot}`);
}

async function generateMerkleRoot(addresses) {
    console.log('\n========Generating Merkle Root========');
    const merkleTree = StandardMerkleTree.of(addresses, ["address", "uint256"]);
    const _root = merkleTree.root;
    console.log(`MERKLE ROOT: ${merkleTree.root}`);
    return {_root, merkleTree};
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
    const {_root, merkleTree} = await generateMerkleRoot(addresses);
    const _airdropInstance = await deployAirdrop(_root, _tokenInstance);

    await claimAirdrop(addr1.address, _airdropInstance, _tokenInstance, addresses, merkleTree);

    console.log('\nDeployment and claims completed successfully');
}

main().catch((error) => {
    console.error('\nError:', error);
    process.exit(1);
});