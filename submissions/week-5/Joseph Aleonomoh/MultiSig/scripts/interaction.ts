import { ethers } from "hardhat";
import accounts from "../accounts.json";

async function deployToken() {
    console.log('\n========Deploying Token Contract========');
    const signer = ethers.provider.getSigner();
    const _tokenContract = await ethers.deployContract("Token", ["Leo", "LTK"]);
    const receipt = await _tokenContract.waitForDeployment();

    console.log(`\nTOKEN DEPLOYED AT: ${_tokenContract.target}`);
    return _tokenContract;
}

async function deployMultiSig(boardMembers, tokenAddress) {
    console.log('\n========Deploying MultiSig Contract========');
    const signer = ethers.provider.getSigner();
    const _multiSigContract = await ethers.deployContract("MultiSig", [boardMembers, tokenAddress]);
    const receipt = await _multiSigContract.waitForDeployment();

    console.log(`MultiSig deployed at: ${_multiSigContract.target}`);
    return _multiSigContract;
}

async function initiateTransaction(_multiSigInstance, destination, amount) {
    console.log('\n========Initiating Transaction========');
    const txId = await _multiSigInstance.initiateTransaction(destination, amount);
    console.log(`Transaction initiated with ID: ${txId}`);
    return txId;
}

async function signTransaction(_multiSigInstance, txId, signer) {
    console.log(`\n========Signing Transaction ${txId}========`);
    const tx = await _multiSigInstance.connect(signer).signTransaction(txId);
    await tx.wait();
    console.log(`Transaction ${txId} signed by ${signer.address}`);
}

async function addLiquidity(_multiSigInstance, _tokenInstance, amount, signer) {
    console.log('\n========Adding Liquidity========');
    const tk = await _tokenInstance.connect(signer)//.approve(_multiSigInstance.target, amount);
    console.log(tk)
    const tx = await _multiSigInstance.connect(signer.privateKey).addLiquidity(amount);
    await tx.wait();
    console.log(`Added ${ethers.formatEther(amount)} tokens as liquidity`);
}

async function main() {
    console.log('======Starting deployment process======');
    
    const signer = await ethers.provider.getSigner();

    const signers = accounts;
    const boardMembers = signers.slice(0, 20).map(signer => signer.address);

    const _tokenInstance = await deployToken();

    const _multiSigInstance = await deployMultiSig(boardMembers, _tokenInstance.target);

    const amount = ethers.parseEther("1000");
    await _tokenInstance.mint(signers[0].address, amount);
    await addLiquidity(_multiSigInstance, _tokenInstance, amount, signers[0]);

    const destinationAddress = signers[19].address;
    const txAmount = ethers.parseEther("100");

    const txId = await initiateTransaction(_multiSigInstance, destinationAddress, txAmount);

    for (let i = 0; i < 20; i++) {
        await signTransaction(_multiSigInstance, txId, signers[i]);
    }

    console.log('\nDeployment and test transaction completed successfully');
}

main().catch((error) => {
    console.error('\nError:', error);
    process.exit(1);
});