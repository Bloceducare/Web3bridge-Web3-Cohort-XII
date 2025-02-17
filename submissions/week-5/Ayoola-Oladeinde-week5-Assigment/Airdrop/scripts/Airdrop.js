const { ethers } = require('ethers');
const { contractAbi, contractAddress } = require('../utils/AirdropConstants');
const { tokenAbi, tokenAddress } = require('../utils/TokenConstants');
require('dotenv').config();
// Load environment variables
const PRIVATE_KEY = process.env.SECRET_KEY;
const RPC_URL = process.env.API_KEY;
console.log(PRIVATE_KEY);
console.log(RPC_URL);

// Function to initialize provider and wallet
async function init() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  const airdropContract = new ethers.Contract(
    contractAddress,
    contractAbi,
    wallet
  );
  const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, wallet);

  return { provider, wallet, airdropContract, tokenContract };
}

// Function to fund the Airdrop contract
async function fundAirdropContract(amount) {
  const { tokenContract, wallet } = await init();

  const amountInWei = ethers.parseEther(String(amount));
  const ownerBalance = await tokenContract.balanceOf(String(wallet.address));

  console.log(`Owner's balance: ${ethers.formatEther(ownerBalance)} tokens`);

  if (BigInt(ownerBalance) < BigInt(amountInWei)) {
    console.error('❌ Not enough balance to fund the Airdrop contract!');
    return;
  }

  console.log(`Funding Airdrop contract with ${amount} tokens...`);
  const tx = await tokenContract.transfer(contractAddress, amountInWei);
  await tx.wait();
  console.log('✅ Airdrop contract funded successfully!');
}

// Function to whitelist an address
async function whitelistAddress(address) {
  const { airdropContract } = await init();

  console.log(`Whitelisting ${address}...`);
  const tx = await airdropContract.setWhitelist(address, true);
  await tx.wait();
  console.log(`✅ Address ${address} is whitelisted!`);
}

// Function to check if an address is whitelisted
async function checkWhitelist(address) {
  const { airdropContract } = await init();

  const isWhitelisted = await airdropContract.whitelisted(address);
  console.log(`Is ${address} whitelisted? ➝ ${isWhitelisted}`);
}

// Function to airdrop tokens
async function airdropTokens(recipient, amount) {
  const { airdropContract, tokenContract, wallet } = await init();

  const amountInWei = ethers.parseEther(String(amount));
  const balance = await tokenContract.balanceOf(wallet.address);

  console.log(`Sender balance: ${ethers.formatEther(balance)} tokens`);

  if (BigInt(balance) < BigInt(amountInWei)) {
    console.error('❌ Not enough balance for airdrop!');
    return;
  }

  console.log(`Airdropping ${amount} tokens to ${recipient}...`);
  const tx = await airdropContract.airdrop(recipient, amountInWei);
  await tx.wait();
  console.log(`✅ Airdrop successful! Sent ${amount} tokens to ${recipient}`);
}

// Function to batch airdrop tokens
async function batchAirdrop(recipients, amounts) {
  const { airdropContract } = await init();

  const amountsInWei = amounts.map((amount) =>
    ethers.parseEther(String(amount))
  );

  console.log(`Batch airdropping tokens...`);
  const tx = await airdropContract.batchAirdrop(recipients, amountsInWei);
  await tx.wait();
  console.log(`✅ Batch airdrop successful!`);
}

// Function to check balance of an address
async function checkBalance(address) {
  const { tokenContract } = await init();

  const balance = await tokenContract.balanceOf(address);
  console.log(`Balance of ${address}: ${ethers.formatEther(balance)} tokens`);
}

// Execute the script based on command-line arguments
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    if (command === 'fund') {
      await fundAirdropContract(args[1]); // fund <amount>
    } else if (command === 'whitelist') {
      await whitelistAddress(args[1]);
    } else if (command === 'check-whitelist') {
      await checkWhitelist(args[1]);
    } else if (command === 'airdrop') {
      await airdropTokens(args[1], args[2]); // airdrop <address> <amount>
    } else if (command === 'batch-airdrop') {
      const recipients = args[1].split(',');
      const amounts = args[2].split(',');
      await batchAirdrop(recipients, amounts);
    } else if (command === 'balance') {
      await checkBalance(args[1]);
    } else {
      console.log(
        `❌ Invalid command! 
        Usage:
        node scripts/Airdrop.js fund <amount>
        node scripts/Airdrop.js whitelist <address>
        node scripts/Airdrop.js check-whitelist <address>
        node scripts/Airdrop.js airdrop <address> <amount>
        node scripts/Airdrop.js batch-airdrop "<address1,address2>" "<amount1,amount2>"
        node scripts/Airdrop.js balance <address>`
      );
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();
