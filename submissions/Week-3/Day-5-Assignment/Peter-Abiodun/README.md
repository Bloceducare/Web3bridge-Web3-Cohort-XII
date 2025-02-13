# Donation Smart Contract

This Solidity smart contract allows users to donate Ether, keeps track of contributions, and enables the contract owner to withdraw funds.

## Features
- ✅ Accepts Ether donations
- ✅ Tracks total donations and individual donor contributions
- ✅ Allows only the contract owner to withdraw funds
- ✅ Implements access control using modifiers
- ✅ Validates inputs with `require` statements

---

## 🛠 Contract Overview

### 📌 State Variables
- `owner`: Stores the deployer's address.
- `donations`: A mapping that tracks each donor's total contributions.
- `totalDonations`: Holds the total Ether donated.

### 🔒 Modifiers
- `onlyOwner`: Restricts function execution to the contract owner.

### ⚙️ Functions

#### 🔹 `constructor()`
- Sets the deployer as the contract owner.

#### 🔹 `donate()`
- Allows users to send Ether to the contract.
- Requires that the donation amount is greater than `0`.

#### 🔹 `withdraw()`
- Transfers all contract funds to the owner.
- Requires that the contract balance is greater than `0`.

#### 🔹 `getDonation(address donor) → uint256`
- Returns the donation amount of a specific address.

---
