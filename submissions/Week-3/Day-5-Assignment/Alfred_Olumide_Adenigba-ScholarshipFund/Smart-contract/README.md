# **Decentralized Scholarship Fund**

This smart contract enables donors to contribute funds and allows students to apply for scholarships. The contract owner (admin) reviews applications and approves funding.

## **Features**
- **Donations**: Any user can donate ETH to the contract.
- **Student Applications**: Students can submit scholarship applications.
- **Approval System**: Only the contract owner can approve applications.
- **Secure Withdrawals**: Approved students can withdraw their scholarship funds.
- **Access Control**: Uses modifiers to restrict admin functions.
- **Error Handling**: Implements `require` to prevent invalid operations.

## **Deployment Instructions**

### **Prerequisites**
- Node.js installed
- Hardhat installed (`npm install --save-dev hardhat`)
- Sepolia testnet account with ETH for deployment

### **Steps to Deploy**
1. **Clone the repository**
   ```sh
   git clone https://github.com/7maylord/Web3bridge-Web3-Cohort-XII.git
   cd Web3bridge-Web3-Cohort-XII
   ```

2. **Install Dependencies**
   ```sh
   npm install
   ```

3. **Compile the Smart Contract**
   ```sh
   npx hardhat compile
   ```

4. **Deploy to Sepolia and verify**
   ```sh
   npx hardhat ignition deploy ignition/modules/ScholarshipFund.ts --network sepolia --verify
   ```

---

## **Report: Solidity Concepts Used**

### **1. Data Types**
- Used `uint`, `string`, `bool`, `address`, `struct`, and `mapping` to store contract data.

### **2. Constructor**
- The `constructor` initializes the contract owner as `msg.sender`.

### **3. Modifiers**
- `onlyOwner` ensures only the contract owner can approve scholarships.

### **4. Functions**
- `donate()`: Allows users to send ETH donations.
- `applyForScholarship()`: Enables students to submit applications.
- `approveScholarship()`: Allows the owner to approve applications.
- `withdraw()`: Lets approved students withdraw their funds.
- `getBalance()`: Retrieves the contract's ETH balance.

### **5. Mappings**
- `mapping(address => Application) applications`: Stores student applications.
- `mapping(address => uint) donations`: Tracks donations by donors.

### **6. Structs**
- `struct Application`: Holds student application details (name, age, course, approval status , hasWithdrawn status).

### **7. Error Handling**
- `require` statements validate input parameters and contract conditions.
  - Ensure donations and withdrawal amounts are valid.
  - Prevent duplicate applications.
  - Ensure only approved students can withdraw funds.

This contract demonstrates secure fund management with access control, input validation, and proper event handling.

---

## **Contact**
For any questions, reach out to **[MayLord](https://github.com/7maylord)**.

