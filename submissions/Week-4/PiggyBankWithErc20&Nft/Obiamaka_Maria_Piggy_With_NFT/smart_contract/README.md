#iPggyBank Smart Contract with NFT Rewards

#Overview

PiggyBank is a smart contract that allows users to save funds until a set withdrawal date. Contributors who save twice receive an NFT as a reward.

#Features

Users can contribute funds to the PiggyBank.

Contributors who save twice receive a unique ERC721 NFT.

A manager can withdraw funds after the withdrawal date if the target amount is reached.

#Technologies Used

Solidity (v0.8.28)

OpenZeppelin ERC721 (for NFT functionality)

OpenZeppelin Ownable (for access control)

#How It Works

Users contribute funds via the save() function.

If a user contributes twice, they receive an NFT.

The manager can withdraw funds after the withdrawal date if the target amount is met.

Installation

Clone the repository:

git clone <repo-url>

Install dependencies:

npm install @openzeppelin/contracts

Deployment

Deploy the contract using Hardhat or Remix:

constructor(uint256 _targetAmount, uint256 _withdrawalDate, address _manager)

_targetAmount: The savings goal.

_withdrawalDate: The date when funds can be withdrawn.

_manager: Address of the contract manager.

Usage

Call save() to contribute funds.

Call withdrawal() (only manager) to withdraw funds after the withdrawal date.

License: UNLICENSED
