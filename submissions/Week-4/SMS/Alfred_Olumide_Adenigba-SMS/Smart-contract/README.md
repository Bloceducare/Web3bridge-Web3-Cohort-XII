#### Contract Address: 0x4DbA08386E7D91dd61bBE0123CE96D31dC42a58a
#### DO NOT SEND ETH TO THIS ADDRESS 
#### THIS IS A SIMULATED TESTNET CONTRACT, FUNDS SENT CANNOT BE WITHDRAWN

# **School Management System - Smart Contract**

## **Overview**
The **School Management System** is a Solidity smart contract that enables a decentralized school administration. It allows the principal to manage students, staff, tuition payments, and course registration. The contract ensures transparency and automation in handling school funds.

## **Features**
- **Student Registration**: Staff can register students.
- **Tuition Payment**: Students can pay their fees in ETH.
- **Course Management**: Staff can add courses, and students can register for them.
- **Staff Management**: The principal can add or remove staff members.
- **Withdraw Funds**: The principal can withdraw collected tuition fees.
- **Pay Staff Salaries**: The principal can distribute salaries to staff members.

## **Roles & Permissions**
- **Principal**:
  - Adds and removes staff.
  - Withdraws funds and pays staff salaries.
  - Removes students.
- **Staff**:
  - Registers students.
  - Adds courses.
- **Students**:
  - Pay tuition fees.
  - Register for courses.

## **Smart Contract Functions**

### **Principal Functions**
- `addStaff(address _staffAddr)`: Adds a new staff member.
- `removeStaff(address _staffAddr)`: Removes a staff member.
- `removeStudent(uint256 _studentId)`: Removes a student.
- `withdrawFunds()`: Withdraws all contract funds to the principal’s wallet.
- `payStaffSalary(address _staffAddr, uint256 _amount)`: Pays salary to a staff member.

### **Staff Functions**
- `registerStudent(uint256 _id, string memory _name, uint16 _age, address _studentAddr)`: Registers a new student.
- `addCourse(uint256 _courseId, string memory _name)`: Adds a new course.

### **Student Functions**
- `payTuition(uint256 _studentId)`: Pays the required tuition fee.
- `registerForCourse(uint256 _studentId, uint256 _courseId)`: Enrolls a student in a course.
- `getStudentDetails(uint256 _studentId)`: Fetches student details.

### **Other Functions**
- `receive() external payable {}`: Allows ETH deposits directly to the contract.

## **Deployment Steps**
### **1. Clone the Repository**
```sh
git clone https://github.com/7maylord/school-management-system.git
cd school-management-system
```

### **2. Install Dependencies**
```sh
npm install
```

### **3. Compile the Contract**
```sh
npx hardhat compile
```

### **4. Deploy to Sepolia Testnet**
```sh
npx hardhat ignition deploy ignition/modules/SchoolManagementSystem.ts --network sepolia --deployment-id sepolia-deployment
```

### **5. Verify the Contract**
```sh
npx hardhat ignition verify sepolia-deployment
```

## **License**
This project is licensed under the MIT License.

---

## Author
Developed by **[MayLord](https://github.com/7maylord)**. Feel free to contribute and improve the project!

---

Happy coding! 🚀



