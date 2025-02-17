# ValSafeLock | PiggyBank-Ether-With-Test

ValSafeLock is a smart contract that acts as a time-locked savings vault, allowing deposits but restricting withdrawals until Valentine's Day.

## Features
- Users can deposit Ether into the contract.
- The owner can withdraw funds only on Valentine's Day.
- Non-owners are restricted from withdrawing.
- Prevents withdrawals before the unlock date.

## Testing
This project includes a test file written in JavaScript using Hardhat and Chai for testing.

Run the tests with:
```bash
npx hardhat test
```

## Requirements
- [Node.js](https://nodejs.org/)
- [Hardhat](https://hardhat.org/)
- [Chai](https://www.chaijs.com/)


