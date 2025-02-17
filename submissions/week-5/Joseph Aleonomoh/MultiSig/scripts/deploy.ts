import { ethers } from "hardhat";

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

async function main() {
    console.log('======Starting deployment process======');
    
    const signer = await ethers.provider.getSigner();

    const signers = [signer].concat()
    const boardMembers = signers.slice(0, 20).map(signer => signer.address);

    const _tokenInstance = await deployToken();

    const _multiSigInstance = await deployMultiSig(boardMembers, _tokenInstance.target);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});