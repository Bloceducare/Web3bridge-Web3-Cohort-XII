# Task Management Smart Contract

## Overview

A decentralized task management system implemented on the Ethereum blockchain that allows creating, assigning, and completing tasks with reward distributions.

## Features

- Create and assign tasks with deadlines and rewards
- Track task completion status
- Distribute rewards for completed tasks
- View task details and user assignments

## Implementation Details

### Data Types Used

- address: For storing owner and assigned user addresses
- uint256: For storing task count, deadlines, and rewards
- string: For storing task titles and descriptions
- bool: For tracking task completion status
- struct: For organizing task data
- mapping: For storing tasks and user relationships

## Constructor

### Initializes the contract owner upon deployment

## Modifiers

- onlyOwner: Restricts access to owner-only functions
- taskExists: Validates task existence before operations
- onlyAssignedUser: Ensures only assigned users can complete tasks

## Functions

- createTask: Creates new tasks with title, description, deadline, assigned user, and reward
- completeTask: Marks tasks as completed and allocates rewards
- claimRewards: Allows users to claim their accumulated rewards
- getTaskDetails: Retrieves detailed information about a specific task
- getUserTasks: Gets all tasks assigned to a specific user

## Error Handling

- Custom errors for invalid deadlines, task not found, unauthorized access
- Require statements for input validation
- Proper error handling for reward transfers

## Access Control

- Owner-restricted task creation
- User-restricted task completion
- Public view functions for transparency

## Implementation Details

1. Install Dependencies: `npm install`
2. Set Up `.env` File
3. Deploy: `npx hardhat run scripts/deploy.js --network sepolia`
4. Verify: `npx hardhat verify --network sepolia <contract_address>`

## Security Considerations

- Reentrancy protection in reward claims
- Input validation for all functions
- Access control modifiers
- Deadline validation