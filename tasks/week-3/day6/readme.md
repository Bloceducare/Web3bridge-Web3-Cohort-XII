# Class Registration System

**This project is a simple class registration system built with **Solidity** for the smart contract and **React** for the frontend. The admin can register students for a class, and users can view all registered students.**

---

**Deployment contract address:** `0x8ccc2d03f38b5816c23d956a9aa467ea7f3269c9`
**live link:** https://delicate-figolla-59cfe6.netlify.app/

## **Table of Contents**

- [Smart Contract](#smart-contract)
  - [Getting Started](#getting-started)
  - [Contract Functions](#contract-functions)
  - [Deployment](#deployment)
- [Frontend](#frontend)
  - [Getting Started](#frontend-getting-started)
  - [Usage](#frontend-usage)
  - [Technologies](#technologies)

---

## **Smart Contract**

### **Getting Started**

To deploy the smart contract:

1. Install dependencies:

   ```bash
   npm install
   ```

2. Update the `.env` file with the necessary values for Infura, your account private key, and contract address.
   
3. Compile and deploy the contract:

   ```bash
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network sepolia
   ```

4. After successful deployment, copy the deployed contract address.

### **Contract Functions**

- **registerStudent(uint256 _id, string _name):**
  - Registers a student with a unique ID and name. 
  - Only the admin can call this function.

- **removeStudent(uint256 _id):**
  - Removes a student by ID. Only the admin can call this function.

- **getStudent(uint256 _id):**
  - Retrieves the name of the student based on the provided ID.

- **getAllStudents():**
  - Returns an array of all student IDs stored in the contract.

---

### **Deployment**

Deploy the contract on the Sepolia network using Hardhat. Ensure that you have the following in your `.env` file:

```plaintext
INFURA_SEPOLIA_API_KEY_URL=
ACCOUNT_PRIVATE_KEY=
```

---

## **Frontend**

### **Frontend Getting Started**

1. Clone the repository:

   ```bash
   git clone https://github.com/your_username/project-name.git
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. The app will run at `http://localhost:3000`.

### **Frontend Usage**

- **Connect MetaMask:**  
  You need MetaMask installed to interact with the smart contract.
  
- **Register a Student:**  
  Enter the student ID and name in the input fields and click on "Register Student."
  
- **Fetch Students:**  
  Click the "Fetch Students" button to view the list of registered students.

---

### **Technologies**

- **Frontend:**
  - React
  - Vite
  - Ethers.js
  - MetaMask

- **Smart Contract:**
  - Solidity
  - Hardhat
  - Sepolia Network
