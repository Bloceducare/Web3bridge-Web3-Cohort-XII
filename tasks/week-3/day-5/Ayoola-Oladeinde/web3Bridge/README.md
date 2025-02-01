```markdown
# Car Rental Smart Contract

## Overview
This Solidity smart contract implements a decentralized **Car Rental System** where users can rent and return cars. It incorporates various Solidity features such as structs, mappings, modifiers, error handling, and access control.

## Features
- **Owner Control:** Only the contract owner can add cars to the system.
- **Car Inventory Management:** Stores details about available and rented cars.
- **Car Rental Process:** Users can rent cars by paying the required fee.
- **Car Return Mechanism:** Users can return rented cars and receive a partial refund.
- **Events:** Logs key actions like adding, renting, and returning cars.

## Solidity Concepts Used
### 1. **Data Types**
   - `uint`: Used for IDs, daily rates, and rental days.
   - `string`: Stores car models.
   - `address`: Stores user and owner addresses.
   - `enum`: Defines car availability status (`Available`, `Rented`).
   
### 2. **Constructor**
   - Initializes the contract owner as the deployer (`msg.sender`).

### 3. **Modifiers**
   - `onlyOwner`: Ensures only the owner can perform certain actions.
   - `carExists`: Ensures the requested car ID is valid.
   - `isAvailable`: Ensures the car is available before renting.

### 4. **Functions**
   - `addCar`: Adds a car to the system.
   - `rentCar`: Allows a user to rent a car by sending Ether.
   - `returnCar`: Allows a user to return a rented car and receive a refund.
   - `getCarDetails`: Retrieves details of a specific car.

### 5. **Mappings**
   - `cars`: Stores all cars in the system.
   - `rentals`: Tracks rental details for each car.

### 6. **Structs**
   - `Car`: Contains details of each car (ID, model, rate, status).
   - `Rental`: Stores rental details (renter address, rental start time, duration).

### 7. **Error Handling (require)**
   - Validates inputs (e.g., rental days must be > 0).
   - Ensures sufficient payment for rental.
   - Restricts unauthorized access to car rental returns.

## Deployment & Usage
1. Deploy the contract on an Ethereum-compatible blockchain (e.g., Polygon, Ethereum testnets).
2. Use the `addCar` function (owner only) to add cars.
3. Users can call `rentCar` by sending the required Ether amount.
4. Users can return rented cars using `returnCar` and receive a refund.
5. Use `getCarDetails` to check car availability and pricing.

## Conclusion
This contract demonstrates a real-world use case of **decentralized car rentals** with **proper access control**, **secure transactions**, and **input validation**. It ensures fair and transparent car rental management on the blockchain.
```

