import { ethers } from "hardhat";
import { MultiSigWallet } from "../typechain-types";

async function main() {
  const [owner, ...boardMembers] = await ethers.getSigners();
  const boardMemberAddresses = boardMembers.slice(0, 20).map((member) => member.address);

  const MultiSigWalletFactory = await ethers.getContractFactory("MultiSigWallet");
  const multiSigWallet = (await MultiSigWalletFactory.deploy(
    boardMemberAddresses
  )) as MultiSigWallet;
  await multiSigWallet.deployed();

  console.log("MultiSigWallet deployed to:", multiSigWallet.address);


  await multiSigWallet.connect(owner).deposit({ value: ethers.utils.parseEther("1.0") });
  console.log("Deposited 1 ETH into the wallet");

  await multiSigWallet.connect(boardMembers[0]).proposeExpense(
    ethers.utils.parseEther("0.1"),
    boardMembers[1].address
  );
  console.log("Expense proposed by board member 0");


  for (let i = 0; i < 20; i++) {
    await multiSigWallet.connect(boardMembers[i]).approveExpense(0);
    console.log(`Expense approved by board member ${i}`);
  }


  await multiSigWallet.connect(boardMembers[0]).releaseFunds(0);
  console.log("Funds released for expense 0");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });