# Subgraph and Web3 Frontend Development final Task

## Objective

Create a subgraph and frontend application to interact with the provided staking smart contract, demonstrating proficiency in The Graph Protocol and dApp development in general.

## Requirements

### 1. Subgraph Development

-   **Schema Definition**: Create an appropriate schema that tracks:

    -   User, Stakes, StakePositions, Withdrawals, Rewards, etc
    -   Contract-wide metrics (totalStaked, currentRewardRate, etc)

-   **Event Handling**: Implement handlers for all contract events:
    -   Staked
    -   Withdrawn
    -   RewardsClaimed
    -   RewardRateUpdated
    -   EmergencyWithdrawn

### 2. Frontend Development

-   **User Interface**:

    -   Wallet connection functionality
    -   Staking form with amount input
    -   Withdrawal interface
    -   Rewards claim section
    -   Emergency withdrawal option
    -   All Stake position display
    -   User Stake position display

-   **Data Display**:
    -   Current staking position
    -   Pending rewards
    -   Time until unlock
    -   Current APR
    -   Total protocol statistics

### 3. Integration Requirements

-   **Subgraph Integration**:

    -   Query user's staking history
    -   Display protocol metrics
    -   Show total value locked

-   **Contract Interaction**:
    -   Implement all core functions:
        -   stake()
        -   withdraw()
        -   claimRewards()
        -   emergencyWithdraw()
    -   Data display:
        -   Get all or most data needed from the subgraph,
        -   Limit the need to get data directly from the smart contract as that is what the subgraph is meant for

### 4. Technology Stack

-   **Subgraph**:

    -   The Graph CLI

-   **Frontend**:
    -   Framework: React/Next.js (javascript/typecript)
    -   Web3 Library: ethers.js
    -   GraphQL Client: Apollo Client/URQL/graphql-request, or any other lib of your choice

## Additional Information

-   Contract: deploy [staking contract](https://github.com/Timidan/Staking/)
-   Network: sepolia

## Submission Requirements

1. GitHub repository containing:

    - Subgraph code
    - Frontend application
    - README with setup instructions

2. Deployed subgraph URL

3. Deployed frontend application URL
