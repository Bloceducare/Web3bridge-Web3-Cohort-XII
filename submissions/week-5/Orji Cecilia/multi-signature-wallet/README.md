# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.ts
```

The contract only allows fund withdrawals through a multi-signature approval process, ensuring transparency and security.

How Withdrawal Works:
- A board member submits a transaction using addTransaction with:

- Target address (who receives the funds).
- Amount (how many tokens to send).
Optional payload (in case of function calls).
All 20 board members must approve the transaction using approveTransaction.

Once all approvals are collected, a board member calls runTransaction, which:

Transfers the ERC20 tokens to the target.
Marks the transaction as executed.