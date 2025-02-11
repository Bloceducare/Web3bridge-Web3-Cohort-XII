# PiggyBankEtherWithTests

A decentralized savings smart contract that allows users to save Ether with withdrawal restrictions and target goals.

## Overview

The PiggyBank smart contract implements a time-locked savings mechanism with the following features:

- Users can deposit Ether into the contract.
- Withdrawals are restricted until a predetermined unlock date.
- Only the designated manager can withdraw funds.
- A target amount must be reached before withdrawal is allowed.
- Tracks individual contributions and the number of unique contributors.

## Key Features

- **Time-Locked Savings**: Funds are locked until the withdrawal date set at deployment.
- **Target Amount**: A minimum savings goal must be met before withdrawal.
- **Manager Control**: Only the designated manager can withdraw funds.
- **Contribution Tracking**: Records individual deposits and total unique contributors.
- **Event Logging**: Emits events for deposits and withdrawals.

## Testing

The project includes tests written in TypeScript using the Hardhat framework. Tests cover contract deployment, saving functionality, withdrawal restrictions, target amount validation, manager access control, and event emissions.

### Running Tests

To run the tests, use the following command:

```bash
npx hardhat test