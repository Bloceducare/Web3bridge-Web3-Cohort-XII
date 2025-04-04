const { ethers } = require('ethers');
const {
  contractAddress,
  contractAbi,
} = require('../utils/crowdFundingConstants');
const { tokenAddress, tokenAbi } = require('../utils/tokenAConstants');
require('dotenv').config();

const provider = new ethers.JsonRpcProvider(process.env.API_KEY);
const wallet = new ethers.Wallet(process.env.SECRET_KEY, provider);
const backer = new ethers.Wallet(process.env.SECRET_KEY2, provider);
const contract = new ethers.Contract(contractAddress, contractAbi, wallet);
const token = new ethers.Contract(tokenAddress, tokenAbi, wallet);

const startCrowdfundingFlow = async () => {
  try {
    console.log('\n🛠️ Creating a crowdfunding project...');

    const createProjectTx = await contract.createProject(
      tokenAddress,
      ethers.parseEther('100'),
      86400
    );
    const projectReceipt = await createProjectTx.wait();
    const projectId = projectReceipt.logs[0].args.projectId.toString();
    console.log(`✅ Project Created! ID: ${projectId.toString()}`);
    console.log(projectId);

    console.log('\n🛠️ Sending tokens to backer...');

    await token.transfer(backer.address, ethers.parseEther('100'));
    const backerBalance = await token.balanceOf(backer.address);
    console.log(`Backer Balance: ${ethers.formatEther(backerBalance)} tokens`);

    console.log('✅ Tokens sent to backer!');

    console.log('\n🛠️ Backer contributing to the project...');

    await token
      .connect(backer)
      .approve(contractAddress, ethers.parseEther('100'));
    const nonce = await wallet.getNonce();
    await contract
      .connect(backer)
      .contribute(projectId, ethers.parseEther('100'), {
        nonce,
        gasPrice: 200000000,
        gasLimit: 1000000,
      });
    console.log('✅ Contributions made!');

    console.log('\n📊 Checking project funding status...');
    const project = await contract.projects(projectId);
    if (project.amountRaised >= project.goal) {
      console.log('\n🛠️ Releasing funds to project creator...');
      await contract.releaseFunds(projectId);
      console.log('✅ Funds released successfully!');
    } else {
      console.log('\n🛠️ Issuing refunds to backers...');
      await contract
        .connect(backer)
        .claimRefund(projectId, {
          nonce,
          gasPrice: 200000000,
          gasLimit: 1000000,
        });
      console.log('✅ Refunds claimed successfully!');
    }
  } catch (error) {
    console.error('❌ Error in crowdfunding flow:', error);
  }
};

startCrowdfundingFlow();
