# Automated Inheritance Will Smart Contract

This smart contract automates inheritance transfer by ensuring a son can only withdraw funds after a set period following his father’s death.

**Concepts:**

Data Types:	`uint256`, `bool`, `address`, `struct`, `enum`
Constructor: Initializes `father`, `son`, `unlockTime`, and deposits funds
Modifiers:	Restricts functions based on conditions (`onlyFather`, `onlySon`, `fatherDeceased`)

**Deployment Address:** `0x56751F7F7e9aD145De37599E7DE0725b2215188D`