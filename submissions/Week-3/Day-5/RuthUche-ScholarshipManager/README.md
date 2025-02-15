# Scholarship Management Smart Contract

This smart contract manages the registration of students and scholarships awarded to them. It enables an administrator(Owner of the contract) to register students, grant them a scholarship, and allows students to claim their scholarship. It also has the ability for the owner to fund the contract.

## Sepolia Contract Address:

[0x6C7b47a49D61B0743b35a8B48DC5e730f2669925](https://sepolia.etherscan.io/address/0x6C7b47a49D61B0743b35a8B48DC5e730f2669925#code)

## Functionality:

•  `registerStudent(address _student, string memory _name)`: Registers a new student while mapping his/her name to a wallet address. This function should be invoked by only the owner of the contract.
•  `allocateScholarship(address _student, uint _amount)`: Allocates some scholarship amount for a registered student. This function should only be invoked by the owner of the contract.
*   `claimScholarship()`: It allows a registered student to claim their allocated scholarship. A student will only be able to claim if they have an allocation and haven't claimed.
*   `fundContract()`: Allowing the owner of the contract to send Ether to the contract to increase its balance. This can be used to fund the pool of scholarships.
`getStudentDetails(address _student)` returns the scholarship details like student's name, allocated amount of scholarship, and status about claimed/due/claim of his scholarship.

## How to Run:

1. **Clone repository:** `git clone <repository_url>`
2. **Install dependencies:** `npm install`
3. **Compile the contract:** `npx hardhat compile`
4. **Deploy the contract:** `npx hardhat run scripts/deploy.ts --network sepolia`
5. **Interact with the contract:** `npx hardhat run scripts/scholars.ts --network sepolia`

## Brief Report:

This contract illustrates the following concepts in Solidity:

*   **Data Types:** Here, `address` is used to declare storage for Ethereum addresses, while `uint256` (it is better to be explicit with the size) is for amount representation and `string` for names.
*   **Structs:** In this case, a `Student` struct has been introduced that comprises name, wallet address, registration status, scholarship amount, and claim status.
*   **Mappings:** Used a mapping type of `mapping(address => Student)` to store or retrieve students' details based on their particular wallet addresses.
*   **Functions:** Also, some functions were implemented, such as `registerStudent`, `allocateScholarship`, `claimScholarship`, `fundContract`, and `getStudentDetails`, to capture student registration, scholarship allocation, funding, and data retrieval.
*   **Modifiers:** The modifier `onlyOwner` restricts access to the administrative functions, such as `registerStudent`, `allocateScholarship`, and `fundContract`, while the `onlyRegisteredStudent` ensures that only a registered student can claim the scholarship.
*   **Error Handling:** Used the `require` statements for various possible errors to validate inputs: trying to register an already registered student, trying to allocate scholarship amount being zero or less, or claiming when no allocation.