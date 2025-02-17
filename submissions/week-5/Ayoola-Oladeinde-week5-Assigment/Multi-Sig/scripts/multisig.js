const { ethers } = require('ethers');
require('dotenv').config();
const { contractAddress, contractAbi } = require('../utils/constants');

async function main() {
  // Setup provider & wallet
  const provider = new ethers.JsonRpcProvider(process.env.API_KEY);
  const wallet = new ethers.Wallet(process.env.SECRET_KEY, provider);

  // Connect to the contract
  const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

  console.log('Connected to MultiSigBoard at:', contractAddress);

  // Deposit ETH
  console.log('\nDepositing 0.00001 ETH...');
  const depositTx = await wallet.sendTransaction({
    to: contractAddress,
    value: ethers.parseEther('0.00001'),
  });
  await depositTx.wait();
  console.log('Deposit successful!');

  // Add a new board member
  const newBoardMember = '0xf04990915C006A35092493094B4367F6d93f9ff0'; // Replace with actual address
  console.log(`\nAdding new board member: ${newBoardMember}...`);
  const addTx = await contract.addBoardMember(newBoardMember);
  await addTx.wait();
  console.log('Board member added!');

  // Sign a transaction
  const txHash = ethers.keccak256(ethers.toUtf8Bytes('withdrawTx'));
  console.log('\nSigning transaction...');
  const signTx = await contract.signTransaction(txHash);
  await signTx.wait();
  console.log('Transaction signed!');

  // Execute a withdrawal (Ensure enough board members have signed)
  const recipient = '0xf04990915C006A35092493094B4367F6d93f9ff0'; // Replace with actual recipient address
  const amount = ethers.parseEther('0.00001');
  console.log(
    `\nExecuting withdrawal of ${ethers.formatEther(
      amount
    )} ETH to ${recipient}...`
  );
  const withdrawTx = await contract.executeWithdrawal(
    recipient,
    amount,
    txHash
  );
  await withdrawTx.wait();
  console.log('Withdrawal executed successfully!');
}

// Run the script
main().catch((error) => {
  console.error('Error:', error);
});
