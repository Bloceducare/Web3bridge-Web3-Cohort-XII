# PiggyBank Smart Contract

## Overview
PiggyBank is a Solidity smart contract that allows users to save funds towards a target amount until a specified withdrawal date. Only the designated manager can withdraw the funds once the conditions are met.

## Features
- Users can contribute ETH to the contract until the withdrawal date.
- The contract tracks contributions for each user.
- Only the designated manager can withdraw funds after the set date and if the target amount is reached.
- Events are emitted for contributions and withdrawals.

## Contract Details

### State Variables
- `targetAmount`: The total amount required before withdrawal.
- `contributions`: Mapping of contributors to their respective balances.
- `withdrawalDate`: The date after which the funds can be withdrawn.
- `contributorsCount`: Number of unique contributors.
- `manager`: The address responsible for withdrawing funds.

### Events
- `Contributed`: Emitted when a user saves funds.
- `Withdrawn`: Emitted when the manager withdraws funds.

### Modifiers
- `onlyManager`: Ensures only the manager can execute certain functions.

### Functions
- `constructor(uint256 _targetAmount, uint256 _withdrawalDate, address _manager)`: Initializes the contract.
- `save()`: Allows users to contribute ETH.
- `withdrawal()`: Allows the manager to withdraw funds if the conditions are met.

## Hardhat Testing
The contract is tested using Hardhat to ensure its functionality. The test cases include:
- Deployment checks (correct owner, non-zero address).
- Contribution tests (valid and invalid cases).
- Withdrawal tests (timing and amount conditions).
- Unauthorized access prevention.

## Installation and Usage
### Prerequisites
- Node.js
- Hardhat
- Ethereum development environment (e.g., WSL2, Windows, or Linux)

### Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/7maylord/PiggyBank
   cd PiggyBank
   cd Smart-contract
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Compile the contract:
   ```sh
   npx hardhat compile
   ```
4. Run tests:
   ```sh
   npx hardhat test
   ```

## License
This project is unlicensed.

## Author
Developed by **[MayLord](https://github.com/7maylord)**. Feel free to contribute and improve the project!

---

Happy coding! 🚀