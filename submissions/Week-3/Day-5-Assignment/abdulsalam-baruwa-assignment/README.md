# Wallet Smart Contract

## Overview

This Solidity smart contract implements a **secure wallet** with permission-based fund transfers, guardian-controlled ownership reset, and an allowance system.

## Features

- **Owner-Controlled Wallet:** The contract owner can manage funds, set spending limits, and control permissions.
- **Allowance System:** The owner can grant specific addresses permission to send a limited amount of ETH.
- **Guardian-Based Ownership Reset:** Trusted guardians can propose and confirm a new owner in case the original owner is unavailable.
- **Secure Fund Transfers:** Only authorized users can send funds, with built-in security checks.
- **Receives ETH:** The contract can accept ETH deposits.

## Smart Contract Details

### State Variables

- `owner`: The address of the contract owner (payable).
- `allowance`: A mapping storing how much ETH each allowed user can spend.
- `isAllowedToSend`: A mapping indicating whether a user has permission to send funds.
- `guardian`: A mapping storing the guardian addresses.
- `nextOwner`: The address proposed as the new owner.
- `guardiansResetCount`: A counter tracking guardian approvals for an ownership reset.
- `confirmationsFromGuardiansForReset`: The required number of approvals for an ownership change.

### Functions

#### **Constructor**

```solidity
constructor() {
    owner = payable(msg.sender);
}
```

- Initializes the contract with the deployer as the owner.

#### **Guardian-Based Ownership Reset**

```solidity
function proposeNewOwner(address payable newOwner) public {
    require(guardian[msg.sender], "You are no guardian, aborting");
    if(nextOwner != newOwner) {
        nextOwner = newOwner;
        guardiansResetCount = 0;
    }
    guardiansResetCount++;
    if(guardiansResetCount >= confirmationsFromGuardiansForReset) {
        owner = nextOwner;
        nextOwner = payable(address(0));
    }
}
```

- Allows guardians to vote for a new owner.
- If enough guardians confirm, the new owner is set.

#### **Set Allowance**

```solidity
function setAllowance(address _from, uint _amount) public {
    require(msg.sender == owner, "You are not the owner, aborting!");
    allowance[_from] = _amount;
    isAllowedToSend[_from] = true;
}
```

- The owner grants a spending limit to a specific address.

#### **Deny Sending**

```solidity
function denySending(address _from) public {
    require(msg.sender == owner, "You are not the owner, aborting!");
    isAllowedToSend[_from] = false;
}
```

- The owner can revoke send permissions.

#### **Receiving ETH**

```solidity
receive() external payable {}
```

- Allows the contract to receive ETH deposits.

## Deployment & Usage

### **1. Deploying the Contract**

- Deploy the contract using Remix, Hardhat, or Foundry.
- The deployer automatically becomes the owner.

### **2. Setting Allowances**

- The owner calls `setAllowance(address, amount)` to grant spending limits.

### **3. Sending Funds**

- Allowed users call `transfer(address, amount, payload)`.

### **4. Ownership Reset**

- Guardians propose and confirm a new owner using `proposeNewOwner(address)`.

## Security Considerations

- **Only the owner** can set allowances and control funds.
- **Guardians cannot steal funds** but can reset ownership.
- **Allowance system prevents overspending**.

Contract address:
``` 0x7b98297B43a436291D4c258c20AcF9Cd6bA7e735 ```

[Etherscan verified link](https://sepolia.etherscan.io/address/0x7b98297B43a436291D4c258c20AcF9Cd6bA7e735#code)
