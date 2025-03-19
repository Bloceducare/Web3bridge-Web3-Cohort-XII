# TaskPledge: Decentralized Task Commitment and Penalty System

## Overview
TaskPledge is a Solidity smart contract that allows users to commit to completing tasks by locking up a small amount of cryptocurrency as a pledge. If the user completes the task by the deadline, they get their pledge back. If they fail, the pledged amount is donated to a charity of their choice.

This project demonstrates the use of key Solidity concepts such as data types, constructors, modifiers, functions, mappings, structs, and error handling.

---

## Features
1. **Task Creation**:
   - Users can create tasks by providing a description and deadline.
   - A hardcoded pledge amount of `1000000 wei` (0.000001 ETH) is locked in the contract.

2. **Task Completion**:
   - Users can mark tasks as completed before the deadline.
   - If completed, the pledged amount is returned to the user.

3. **Pledge Donation**:
   - If the task is not completed by the deadline, the pledged amount is donated to an approved charity.

4. **Charity Management**:
   - The contract owner can add or remove approved charities.

5. **Access Control**:
   - Only the task creator can mark a task as completed.
   - Only the contract owner can manage approved charities.

---

## How to Use
1. **Deploy the Contract**:
   - Compile and deploy the contract on a testnet (e.g., Sepolia) using Remix or Hardhat.

2. **Create a Task**:
   - Call the `createTask` function with a description and deadline.
   - Example:
     ```solidity
     createTask("Write a blog post", 1698883200);
     ```

3. **Complete a Task**:
   - Call the `completeTask` function with the task ID before the deadline.
   - Example:
     ```solidity
     completeTask(1);
     ```

4. **Donate a Pledge**:
   - If the task is not completed by the deadline, call the `donatePledge` function with the task ID and charity address.
   - Example:
     ```solidity
     donatePledge(1, 0xCharityAddress);
     ```

5. **Manage Charities**:
   - The contract owner can add or remove charities using the `addCharity` and `removeCharity` functions.

---

## Solidity Concepts Used

### 1. **Data Types**
   - **Strings**: Used for task descriptions.
   - **uint256**: Used for deadlines, pledge amounts, and task IDs.
   - **address**: Used for user and charity wallet addresses.
   - **bool**: Used to track task completion status.

### 2. **Constructor**
   - The constructor initializes the contract deployer as the owner.
   - Example:
     ```solidity
     constructor() {
         owner = msg.sender;
     }
     ```

### 3. **Modifiers**
   - **`onlyOwner`**: Restricts access to functions that only the owner can call (e.g., adding/removing charities).
   - **`onlyTaskCreator`**: Ensures only the task creator can mark a task as completed.
   - Example:
     ```solidity
     modifier onlyOwner() {
         require(msg.sender == owner, "Only the owner can call this function");
         _;
     }
     ```

### 4. **Functions**
   - **`createTask`**: Allows users to create tasks with a description and deadline.
   - **`completeTask`**: Allows users to mark tasks as completed.
   - **`donatePledge`**: Donates the pledged amount to a charity if the task is not completed.
   - **`addCharity` and `removeCharity`**: Allows the owner to manage approved charities.

### 5. **Mappings**
   - **`tasks`**: Maps task IDs to task details (stored as structs).
   - **`approvedCharities`**: Maps charity addresses to a boolean indicating approval status.
   - Example:
     ```solidity
     mapping(uint256 => Task) public tasks;
     mapping(address => bool) public approvedCharities;
     ```

### 6. **Structs**
   - **`Task`**: Stores task details such as description, deadline, pledge amount, completion status, and creator address.
   - Example:
     ```solidity
     struct Task {
         string description;
         uint256 deadline;
         uint256 pledgeAmount;
         bool isCompleted;
         address creator;
     }
     ```

### 7. **Error Handling**
   - **`require` Statements**: Used to validate inputs and conditions.
     - Example:
       ```solidity
       require(bytes(_description).length > 0, "Task description cannot be empty");
       require(_deadline > block.timestamp, "Deadline must be in the future");
       ```

### 8. **Events**
   - **`TaskCreated`**: Emitted when a new task is created.
   - **`TaskCompleted`**: Emitted when a task is marked as completed.
   - **`PledgeDonated`**: Emitted when a pledge is donated to a charity.
   - Example:
     ```solidity
     event TaskCreated(uint256 taskId, address creator, string description, uint256 deadline, uint256 pledgeAmount);
     ```

---

## Real-World Use Case
TaskPledge addresses the problem of accountability in task completion. By introducing a financial incentive (pledge amount) and a penalty mechanism (donation to charity), it encourages users to complete their tasks on time while supporting charitable causes.

---

## Deployment
- The contract is deployed on the Sepolia testnet.
- The contract is verified on Etherscan for transparency.

---

