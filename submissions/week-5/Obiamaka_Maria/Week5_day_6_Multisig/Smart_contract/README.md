#MultiSig Wallet

#Overview

The MultiSig Wallet is a Solidity-based smart contract that ensures funds cannot be released until all 20 board members have approved an expense. This project includes:

A Solidity contract for fund management

Hardhat test scripts

An automated interaction script

#Features

Only 20 designated board members can manage the contract.

Board members can propose expenses.

All board members must approve an expense before funds are released.

Funds are stored securely and can only be withdrawn after full approval.

Prerequisites

Before deploying or testing the contract, ensure you have:

Node.js installed

Hardhat installed (npm install --save-dev hardhat)

Ethers.js and Chai for testing (npm install --save-dev @nomicfoundation/hardhat-toolbox)


#MultiSig WalletContract deployed to: 0x3b7188aA1ce3ca66346A5172D0F021B22F83E93F


