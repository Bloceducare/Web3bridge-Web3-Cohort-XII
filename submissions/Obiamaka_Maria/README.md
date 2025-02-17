
# JobMarketPlace 

A decentralized freelance job marketplace smart contract built on Ethereum using Solidity. This contract enables clients to post jobs, freelancers to apply, and secure payments upon job completion.

## Features 🚀
- **Job Posting**: Clients can create jobs with a title, description, and budget.
- **Freelancer Applications**: Freelancers can submit proposals for jobs.
- **Approval System**: Clients approve freelancers for jobs.
- **Job Completion**: Assigned freelancers can mark jobs as completed.
- **Secure Payments**: Clients release funds only after completion.
- **Access Control**: `onlyOwner`, `onlyClient`, and `onlyFreelancer` modifiers ensure security.
- **Event Logging**: Important actions are logged using Solidity events.

## Smart Contract Overview 
- **Language**: Solidity `^0.8.20`
- **Network**: Compatible with Ethereum Virtual Machine (EVM)
- **Security**: Uses `require` statements to prevent invalid transactions.

## Installation & Deployment 
1. Clone this repository:
2. cd JobMarketPlace and then run the following commands:
3.  npm install
4. compile using npx hardhat compile
5. Run npx hardhat run scripts/deploy.js --network <network name> to deploy to a network.

Link to Sepolia Network: https://sepolia.etherscan.io/address/0x9a3faF3fd0764C6d3Ec5A40b2a302220494582dc#code
