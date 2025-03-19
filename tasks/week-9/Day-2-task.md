# Uniswap V2 Pair Data Retrieval Task

## Objective

The goal of this task is to master the use of multicall by retrieving information about Uniswap V2 pairs on the Ethereum mainnet.

## Requirements

### 1. Frontend

-   **User Interface**: Create a simple UI where a user can enter a Uniswap V2 pair contract address.
-   **Wallet Connection**: No wallet connection is required.
-   **Display**: Present the retrieved details in a readable format.

### 2. Smart Contract Interaction

-   **Multicall Usage**: Utilize Multicall to interact with the Uniswap V2 pair contract.
-   **Data Retrieval**: Fetch and display the following information:
    -   **Token Addresses**: Retrieve `token0()` and `token1()`.
    -   **Reserves**: Use `getReserves()`.
    -   **Total Supply**: Obtain the total supply of LP tokens using `totalSupply()`.
    -   **Token Details**: Fetch details from `token0` and `token1` contracts using `name()`, `symbol()`, and `decimals()`.

### 3. Technology Stack

-   **Build Tool**: Vite
-   **Blockchain Interaction**: Ethers.js
-   **UI Framework**: Any framework of your choice

## Additional Information

-   You can find all Uniswap V2 pairs at: [Uniswap Pairs](https://tokenlists.org/token-list?url=https://raw.githubusercontent.com/jab416171/uniswap-pairtokens/master/uniswap_pair_tokens.json)
