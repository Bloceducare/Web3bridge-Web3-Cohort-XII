# School Management Smart Contract

## Overview
The **SchoolManagement** smart contract is designed to manage student records efficiently on the Ethereum blockchain. It allows an assigned teacher to add, update, and retrieve student information while ensuring data integrity and security.

## Features
- **Add a Student**: The teacher can add new student records.
- **Confirm Student Addition**: The teacher can confirm that a student has been added.
- **Retrieve Student Details**: Anyone can retrieve a student's name and age.
- **Update Student Information**: Anyone can update a student's details.
- **Access Control**: Only the assigned teacher (owner) can add students and confirm their addition.

## Smart Contract Details

### **Contract: SchoolManagement**

### **State Variables**
- `user` (**address**): Stores the address of the contract owner (teacher).
- `eachStudent` (**Student[]**): Array that holds all student records.
- `added` (**mapping(uint256 => bool)**): Tracks whether a student has been confirmed as added.

### **Struct: Student**
Defines the student structure with the following properties:
- `id` (**uint**): Unique identifier for the student.
- `name` (**string**): Name of the student.
- `age` (**uint256**): Age of the student.
- `added` (**bool**): Tracks whether the student has been added.
- `confirmed` (**uint256**): Number of times the student has been confirmed.

### **Modifiers**
- `teacher()`: Ensures only the contract owner (teacher) can execute certain functions.

## Functions

### **1. `constructor(address _owner)`**
- **Description**: Initializes the contract and assigns ownership.
- **Parameters**:
  - `_owner` (**address**): The teacher's Ethereum address.

### **2. `addStudent(uint256 _id, string memory name, uint256 _age)`**
- **Description**: Allows the teacher to add a new student.
- **Access Control**: `teacher` modifier (only owner can call this function).
- **Parameters**:
  - `_id` (**uint256**): Student's unique identifier.
  - `name` (**string**): Student's name.
  - `_age` (**uint256**): Student's age.

### **3. `studentAdded(uint256 id) public teacher returns(bool)`**
- **Description**: Confirms that a student has been added.
- **Access Control**: `teacher` modifier (only owner can call this function).
- **Parameters**:
  - `id` (**uint256**): Student's unique identifier.
- **Returns**:
  - `bool`: Returns `true` when the student is confirmed.

### **4. `getStudent(uint id) public view returns(string memory, uint)`**
- **Description**: Fetches the name and age of a student.
- **Parameters**:
  - `id` (**uint**): Student's unique identifier.
- **Returns**:
  - `string`: Student's name.
  - `uint`: Student's age.

### **5. `updateStudent(uint id, string calldata updateName, uint256 updateAge) public`**
- **Description**: Updates the student’s name and age.
- **Parameters**:
  - `id` (**uint**): Student's unique identifier.
  - `updateName` (**string**): New name for the student.
  - `updateAge` (**uint256**): New age for the student.

## Deployment
To deploy the contract using Hardhat, follow these steps:

1. Compile the contract:
   ```sh
   npx hardhat compile
   ```
2. Deploy using a script (`scripts/deploy.js`):
   ```javascript
   async function main() {
       const [deployer] = await ethers.getSigners();
       console.log("Deploying contract with the account:", deployer.address);
   
       const SchoolManagement = await ethers.getContractFactory("SchoolManagement");
       const contract = await SchoolManagement.deploy("0xYourEthereumAddress");
   
       console.log("Contract deployed at:", contract.address);
   }
   
   main().catch((error) => {
       console.error(error);
       process.exit(1);
   });
   ```
3. Run the deployment script:
   ```sh
   npx hardhat run scripts/deploy.js --network sepolia
   ```

## Security Considerations
- **Access Control**: The `teacher` modifier ensures only the teacher can add students.
- **Validation**: The contract checks for valid addresses and prevents unauthorized modifications.
- **Immutable Records**: Student data is stored on-chain, ensuring transparency.

## License
This project is licensed under the **MIT License**.

