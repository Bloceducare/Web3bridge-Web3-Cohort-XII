import hre from "hardhat";

const main = async () => {
  console.log("######### Deploying MultiSig Contract #########");
  // Get signers
  const [owner, signer1, signer2, receiver] = await hre.ethers.getSigners();
  
  const validSigners = [signer1.address, signer2.address];
  const quorum = 2;
  const initialContractBalance = hre.ethers.parseEther("10");
  
  console.log("Owner Address:", owner.address);
  console.log("Valid Signers:", validSigners);
  console.log("Required Quorum:", quorum);
  
  // Deploy the contract
  const MultiSig = await hre.ethers.getContractFactory("MultiSig");
  const multiSig = await MultiSig.deploy(validSigners, quorum, {
    value: initialContractBalance
  });

  const contractAddress = await multiSig.getAddress();
  console.log("MultiSig Contract deployed to:", contractAddress);

  console.log("\n######### Testing Transaction Initiation #########");
  const transactionAmount = hre.ethers.parseEther("1");
  await multiSig
    .connect(signer1)
    .initiateTransaction(transactionAmount, receiver.address);
  
  const allTransactions = await multiSig.getAllTransactions();
  console.log("First Transaction Details:");
  console.table({
    id: allTransactions[0].id.toString(),
    amount: hre.ethers.formatEther(allTransactions[0].amount),
    receiver: allTransactions[0].receiver,
    signersCount: allTransactions[0].signersCount.toString(),
    isExecuted: allTransactions[0].isExecuted,
    txCreator: allTransactions[0].txCreator
  });

  console.log("\n######### Testing Transaction Approval #########");
  await multiSig.connect(signer2).approveTransaction(1); // Transaction ID is 1
  
  const updatedTransactions = await multiSig.getAllTransactions();
  console.log("Transaction after second approval:");
  console.table({
    id: updatedTransactions[0].id.toString(),
    amount: hre.ethers.formatEther(updatedTransactions[0].amount),
    receiver: updatedTransactions[0].receiver,
    signersCount: updatedTransactions[0].signersCount.toString(),
    isExecuted: updatedTransactions[0].isExecuted,
    txCreator: updatedTransactions[0].txCreator
  });

  console.log("\n######### Testing Signer Management #########");
  const newSigner = hre.ethers.Wallet.createRandom();
  console.log("Adding new signer:", newSigner.address);
  
  await multiSig.connect(owner).addValidSigner(newSigner.address);
  const isValidSigner = await multiSig.isValidSigner(newSigner.address);
  console.log("Is new address a valid signer?", isValidSigner);

  console.log("\n######### Testing Ownership Transfer #########");
  const newOwner = hre.ethers.Wallet.createRandom();
  console.log("Current owner:", await multiSig.owner());
  console.log("Transferring ownership to:", newOwner.address);
  
  await multiSig.connect(owner).transferOwnership(newOwner.address);
  console.log("Next owner set to:", await multiSig.nextOwner());

  console.log("\n######### Contract Balance #########");
  const balance = await hre.ethers.provider.getBalance(contractAddress);
  console.log(
    "Contract balance:",
    hre.ethers.formatEther(balance),
    "ETH"
  );

  console.log("\n######### Deployment and Testing Complete #########");
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});