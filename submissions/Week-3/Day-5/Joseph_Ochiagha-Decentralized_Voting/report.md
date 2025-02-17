# Report on Decentralized Voting Smart Contract

CONTRACT_ADDRESS = 0xF74C385A3f16DCCA4645b38D1fFBE79b1D040879

## Introduction

This report details the implementation of a decentralized voting smart contract in Solidity. It covers the use of various Solidity concepts such as data types, constructor, modifiers, functions, mappings, structs, and error handling.

## Key Solidity Concepts Used

### 1. **Data Types**

The contract utilizes the following data types:

- `address`: Used to store the admin’s Ethereum address.
- `string`: Represents candidate names.
- `uint256`: Tracks vote counts and array indices.
- `bool`: Ensures one vote per user.

### 2. **Constructor**

The constructor initializes the contract by:

- Assigning `msg.sender` as the admin.
- Accepting an array of candidate names and adding them to the contract.

### 3. **Modifiers**

The contract uses modifiers to enforce rules:

- `onlyAdmin`: Restricts certain actions to the contract admin.
- `hasNotVoted`: Ensures a user hasn’t voted before allowing them to vote.

### 4. **Functions**

The contract includes the following core functions:

- `addCandidate(string memory _name)`: Adds a new candidate (Admin only).
- `vote(uint256 candidateIndex)`: Allows a user to vote for a candidate.
- `getCandidateCount()`: Returns the total number of candidates.
- `getCandidate(uint256 index)`: Retrieves candidate details.

### 5. **Mappings**

Mappings store key-value pairs for efficient data retrieval:

- `mapping(address => bool) hasVoted`: Tracks whether an address has voted.
- `mapping(string => bool) candidateExists`: Ensures candidate uniqueness.

### 6. **Structs**

The contract uses a struct to store candidate information:

```solidity
struct Candidate {
    string name;
    uint256 voteCount;
}
```

### 7. **Error Handling**

The contract implements error handling using `require` statements:

- Ensuring a candidate exists before adding them.
- Verifying valid indices before accessing candidates.
- Preventing duplicate voting.

## Conclusion

This contract effectively demonstrates key Solidity concepts while ensuring a fair and transparent voting process. The implementation follows best practices in access control, data validation, and security to create a reliable decentralized voting system.

\$ npx hardhat init
