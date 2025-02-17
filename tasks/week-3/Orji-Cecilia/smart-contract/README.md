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

# LibraryManagement Smart Contract
This project is a **decentralized library management system** built with Solidity and Hardhat. It allows the library owner to **add and remove books**, while users can **borrow and return books** securely on the Ethereum blockchain.

## Features
- **Admin**: Add/Remove books
- **Users**: Borrow/Return books
- **Helpers**: Check book existence, View book details

## Setup
```sh
git clone https://github.com/Bloceducare/Web3bridge-Web3-Cohort-XII.git
cd smart-contract
npm install
npx hardhat compile

Implementation
Data Types
The contract uses various data types such as string, uint, address, and bool to manage the library's state.

## Implementation
Data Types
The contract uses various data types such as string, uint, address, and bool to manage the library's state.

## Constructor
The constructor initializes the contract with the library name and sets the deployer as the owner.

constructor(string memory _libraryName) {
    owner = msg.sender;
    libraryName = _libraryName;
}

## Modifiers
Modifiers are used to restrict access to certain functions. For example, onlyOwner ensures that only the contract owner can add or remove books.
modifier onlyOwner() {
    require(msg.sender == owner, "Only the contract owner can perform this action.");
    _;
}