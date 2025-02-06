# CarDealer Smart Contract

## Overview
The `CarDealer` smart contract is an Ethereum-based decentralized application for managing car inventory and sales. It enables an owner to add staff members, who can then register new cars, retrieve car details, and mark cars as sold. The contract implements role-based access control using modifiers and mappings.

## Implementation Details

### 1. Contract Structure
- **Struct `Car`**: Represents a car with attributes including `id`, `name`, `model`, `year`, `mileage`, and `sold` status.
- **State Variables**:
  - `owner`: Stores the contract owner’s address.
  - `car_num`: Keeps track of the total number of cars added.
  - `car`: Temporary storage for car struct.
  - `staffs`: Mapping to track staff members.
  - `cars`: Mapping to store car details indexed by car ID.

### 2. Constructor
The constructor initializes the contract owner as the deployer (`msg.sender`) and assigns them staff privileges.

### 3. Modifiers
- `onlyOwner`: Ensures that only the owner can execute specific functions.
- `onlyStaff`: Restricts certain functions to authorized staff members.

### 4. Core Functions
#### `addCar(string memory _name, string memory _model, uint _year, uint _mileage) public onlyStaff(msg.sender)`
- Allows staff to register a new car.
- Assigns a unique `id` to each car.
- Stores the car details in the `cars` mapping.

#### `getCar(uint _id) public view returns (Car memory)`
- Retrieves car details by `id`.

#### `sellCar(uint _id) public onlyStaff(msg.sender) returns (Car memory)`
- Marks a car as sold.
- Ensures the car has not already been sold.

#### `addStaff(address _address) public onlyOwner`
- Allows the owner to add a new staff member.
- Prevents adding an invalid or existing staff address.

#### `removeStaff(address _address) public onlyOwner`
- Allows the owner to remove a staff member.
- Ensures the address exists before removing it.

## Key Concepts Used
### 1. **Access Control**
- Implemented using `onlyOwner` and `onlyStaff` modifiers to restrict actions.

### 2. **Mappings**
- Used for efficient lookup of staff members and car records.

### 3. **Structs**
- `Car` struct encapsulates car attributes.

### 4. **Modifiers**
- Improve code reusability and security by enforcing role-based restrictions.

### 5. **State Management**
- The contract maintains state using mappings and incrementing counters for unique car IDs.

## Conclusion
The `CarDealer` contract effectively models a decentralized car dealership, enforcing role-based access, managing car inventory, and ensuring transaction integrity.

