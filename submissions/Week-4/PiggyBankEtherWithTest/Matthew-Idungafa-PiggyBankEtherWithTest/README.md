# Ethereum Savings Smart Contracts

This repository contains two smart contracts implemented in Solidity for managing savings on the Ethereum blockchain: a simple personal savings contract and a crowdfunding-style group savings contract.


###  PiggyBank Contract
A multi-user savings contract that enables group saving towards a specific target amount with a predetermined withdrawal date.

**Key Features:**
* Multiple contributor support
* Target amount tracking
* Individual contribution tracking
* Timed withdrawal mechanism
* Managed withdrawal system

**Functions:**
* `save()`: Allows users to contribute ETH
* `withdrawal()`: Enables the manager to withdraw funds when conditions are met
* Contribution tracking per address
* Unique contributor counting



### Solidity Version
```solidity
 0.8.28;

