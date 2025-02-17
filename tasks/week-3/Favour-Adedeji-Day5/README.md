## Task Management Smart Contract

### Overview

This Solidity smart contract implements a decentralized task management system. It allows an owner to create tasks and assign them to users. Assigned users can mark their tasks as completed. The contract ensures access control, task validation, and error handling using Solidity features.

### Features

 - Task Creation: Only the contract owner can create tasks.

 - Task Assignment: Tasks are assigned to specific users.

 - Task Completion: Only the assigned user can mark a task as completed.

 - Access Control: Uses modifiers to restrict function access.

 - Error Handling: Ensures input validation and prevents invalid operations.

### Solidity Concepts Used

 - Data Types: uint, string, address, and bool.

 - Structs: Task struct stores task details.

 - Mappings: tasks stores tasks by ID; userTaskCount tracks user tasks.

 - Modifiers: onlyOwner, validTask, and onlyAssignee restrict function access.

 - Events: TaskCreated and TaskCompleted notify about task changes.

 - Constructor: Initializes contract owner and task counter.

 - Require Statements: Used to validate inputs and enforce conditions.

 - Deployment on Sepolia Using Hardhat

### Prerequisites

 - Install Node.js

 - Install Hardhat: ``` npm install --save-dev hardhat ```

 - Create a Hardhat project: `` npx hardhat ``

 - Configure Hardhat to use the Sepolia network

#### Deployment Steps

 - Compile the contract:

    ``` npx hardhat compile ```

- Deploy the contract:

    ``` npx hardhat run scripts/deploy.js --network sepolia ```

 - Verify the contract:

    ``` npx hardhat verify --network sepolia <DEPLOYED_CONTRACT_ADDRESS>```

    In this contract
    ``` npx hardhat verify --network sepolia 0xf0A947b6DC8541110f9b25d5FB5ba7FC9f91Bb4a ```


 - Usage

 - The owner calls createTask(description, assignee) to assign a task.

 - The assigned user calls completeTask(taskId) to complete the task.

 - Events are emitted on task creation and completion.

 - Security Considerations

 - Access Control: Only the owner can create tasks.

 - Validation: Ensures valid input and prevents duplicate completions.

 - Reentrancy Protection: No external calls prevent reentrancy attacks.

### License

This project is licensed under the MIT License.

