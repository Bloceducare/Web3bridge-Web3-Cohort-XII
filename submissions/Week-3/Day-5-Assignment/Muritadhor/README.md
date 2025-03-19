# SimpleDonation Smart Contract

## Overview
SimpleDonation is a Solidity smart contract that enables users to create and contribute to donation campaigns. Each donation campaign has a unique name, a balance, and a designated starter. The contract ensures secure fund management through access control mechanisms.

## Contract
- **Contract Address**: 0x88Fb99843Ee62d7DD60fdf73e59f7Fe78D171096
- **Verified Contract**: [sepolia explorer](https://sepolia.etherscan.io/address/0x88Fb99843Ee62d7DD60fdf73e59f7Fe78D171096#code)

## Features
- **Create a Donation**: Any user can create a new donation campaign.
- **Donate to a Campaign**: Users can contribute funds to an existing donation.
- **Check Donation Balance**: Anyone can check the balance of a specific donation.
- **Withdraw Funds**: Only the campaign starter can withdraw funds.
- **Delete a Donation**: The contract owner can remove a donation campaign.

## Contract Details
- **Owner**: The deployer of the contract.
- **Starter**: The creator of a donation campaign.
- **Total Balance**: The total amount donated across all campaigns.
- **Mappings**:
  - `donations` stores donation campaign details.
  - `funders` tracks contributions from users.

## Functions

### 1. `createDonation(string calldata donationName) public returns(Donation memory)`
Creates a new donation campaign.
#### Parameters:
- `donationName`: Unique identifier for the donation.
#### Requirements:
- The donation name must not already exist.

### 2. `donate(string calldata donationName, uint256 amount) public returns(Donation memory)`
Allows users to contribute funds to an existing campaign.
#### Parameters:
- `donationName`: The name of the donation campaign.
- `amount`: The amount to donate.
#### Requirements:
- The campaign must exist.
- The donation amount must be greater than 0.

### 3. `getBalance(string calldata donationName) external view returns (uint)`
Retrieves the current balance of a donation campaign.
#### Parameters:
- `donationName`: The name of the donation campaign.

### 4. `withdraw(string calldata donationName) external onlyStarter(donationName) returns(uint)`
Allows the campaign starter to withdraw all funds.
#### Parameters:
- `donationName`: The name of the donation campaign.
#### Requirements:
- Only the starter of the campaign can withdraw.
- The balance must be greater than 0.

### 5. `deleteDonation(string calldata donationName) public onlyOwner`
Allows the contract owner to delete a donation campaign.
#### Parameters:
- `donationName`: The name of the donation campaign.

## Security Measures
- **Access Control**:
  - `onlyOwner`: Restricts certain functions to the contract owner.
  - `onlyStarter`: Restricts withdrawals to the campaign starter.
- **Input Validation**:
  - Ensures unique donation names.
  - Prevents zero-value donations.
- **Safe Withdrawals**:
  - Ensures that only available funds can be withdrawn.

## Deployment
This contract should be deployed on the Sepolia test network using Hardhat. To deploy:
```bash
npx hardhat ignition deploy ignition/modules/SimpleDonation.ts --network sepolia
```

## License
This contract is licensed under the MIT License.

