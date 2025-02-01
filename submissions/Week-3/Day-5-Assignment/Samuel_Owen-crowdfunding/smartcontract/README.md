# Crowdfunding Smart Contract

# Contract Address 
0xa32c896570D3c8280D0918650e9E00D83F510343

# Etherscan Verification Link
https://sepolia.etherscan.io/address/0xa32c896570D3c8280D0918650e9E00D83F510343

## Overview
This smart contract implements a decentralized crowdfunding platform where users can create fundraising campaigns, contribute funds, and withdraw them once the funding goal is met. The contract is deployed on sepolia.

## Features Implemented
- **Campaign Creation**: Users can create a campaign by specifying a title, description, and funding goal.
- **Fund Contribution**: Users can contribute funds to active campaigns.
- **Campaign Completion**: Once a campaign reaches its goal, the campaign owner can withdraw the funds.
- **Access Control**: Restricts actions to appropriate users using modifiers.
- **Event Logging**: Logs key actions like campaign creation, funding, and completion.

## Solidity Concepts Used
### 1. **Structs**
   - Used to define the `Campaign` structure, which holds the campaign details such as ID, title, description, owner, goal, funds raised, and completion status.

### 2. **Mappings**
   - `campaigns`: Stores campaigns using their ID as a key.
   - `contributions`: Keeps track of contributions per campaign and contributor.

### 3. **Modifiers**
   - `onlyPlatformOwner()`: Restricts actions to the platform owner.
   - `onlyCampaignOwner()`: Ensures only the campaign owner can complete a campaign.
   - `campaignExists()`: Validates if a campaign exists before executing certain actions.
   - `notCompleted()`: Ensures the campaign is still active before allowing contributions or withdrawals.

### 4. **Constructor**
   - Initializes the contract with the deployer as the `platformOwner`.

### 5. **Functions**
   - `createCampaign()`: Allows users to create a new crowdfunding campaign.
   - `contribute()`: Enables users to send funds to a campaign.
   - `completeCampaign()`: Allows the campaign owner to withdraw funds once the goal is met.


This contract demonstrates key Solidity concepts while implementing a real-world decentralized crowdfunding solution. 