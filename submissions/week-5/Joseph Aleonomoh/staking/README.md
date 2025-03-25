# Staking Contract

This repository contains a Solidity smart contract for a staking platform, along with a test suite written using Hardhat.  The platform allows users to stake a reward token (LEO TOKEN) and earn rewards based on the staking duration and a defined ROI.

## Contracts

### Erc20.sol

This contract implements the ERC20 standard for the LEO TOKEN (LTK), which is used as the reward token in the staking platform. It inherits from OpenZeppelin's ERC20 and Ownable contracts.

*   **Constructor:** Initializes the token with its name, symbol, and owner.
*   **mint(address \_to, uint256 \_value):** Allows the owner to mint new tokens.

### Staking.sol

This contract manages the staking functionality.

*   **Struct Stake:** Defines the structure for storing stake information for each user, including the amount staked, ROI, reward, stake time, and initial stake time.
*   **Mapping stakes:** Stores stake information for each user.
*   **roi:** Stores the annual ROI percentage.
*   **tokenInstance:** Stores the address of the deployed `RewardToken` contract.
*   **Mapping withdrawn:** Tracks whether a user has withdrawn their stake.
*   **Errors:** Defines custom errors for various scenarios.
*   **Events:** Emits events for staking and withdrawal actions.
*   **Constructor(uint256 \_roi):** Initializes the contract with the ROI and deploys the `RewardToken` contract.
*   **stake(uint256 \_value, uint256 \_stakeTime):** Allows users to stake tokens. It transfers the staked tokens to the contract, calculates the reward based on the staking duration and ROI, and stores the stake information.
*   **withdrawStakes():** Allows users to withdraw their staked tokens and accumulated rewards after the stake time has passed.
*   **calculateReward(address \_address):** Calculates the reward earned by a user based on the time staked.

## Testing

### test/StakingContract.js

This file contains the test suite for the `Staking` contract using Hardhat and Chai.

*   **deployStakingContractFixture():** A fixture function to deploy the contract and set up test accounts.
*   **describe("Deployment", ...):** Tests related to contract deployment.
    *   **it("should deploy the contract", ...):** Checks if the contract is deployed successfully and the ROI is set correctly.
    *   **it("should deploy ERC20 Contract and store instance", ...):** Checks if the ERC20 contract is deployed and the instance is stored correctly in the Staking contract.  *(Note: The provided test currently only checks the ROI, it should be updated to properly test the ERC20 deployment and instance storage.)*

## Getting Started

1.  **Clone the repository:** `git clone <repository_url>`
2.  **Install dependencies:** `npm install` or `yarn install`
3.  **Compile the contracts:** `npx hardhat compile`
4.  **Run the tests:** `npx hardhat test`

## Usage

1.  Deploy the contracts to a suitable network (e.g., Hardhat local network, testnet).
2.  Interact with the `Staking` contract using a wallet or a web3 library.

