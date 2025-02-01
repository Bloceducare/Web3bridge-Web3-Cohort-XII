# ProductManager Smart Contract

## Overview
The `ProductManager`contract helps manage products in a decentralized way. The contract owner can add new products, update existing ones, and archive products that are no longer needed. This contract shows how to use several Solidity features:

- **Data Types:** Usage of types like `uint256`, `string`, and `bool`.
- **Structs:** The `Product` struct holds product details (id, name, description, price, and status).
- **Mappings:** `mapping(uint256 => Product)` efficiently stores and retrieves products.
- **Constructor:** Initializes the contract by setting the deployer as the product manager.
- **Modifiers:** 
  - `onlyManager` restricts some functions to the product manager.
  - `productExists` checks whether a product with a given id exists.
- **Functions:**
  - `addProduct` adds a new product.
  - `updateProduct` updates the details of an active product.
  - `archiveProduct` archives a product, marking it as inactive.
- **Error Handling:** `require` statements validate inputs and state conditions.
- **Events:** Emit events (`ProductAdded`, `ProductUpdated`, and `ProductArchived`) to log key actions for off-chain tracking.

## Deployment on Sepolia using Hardhat

ProductManager deployed to: 0xE81ACDE3E0aFfCa94960a443b5A7bd0328881dC1

### Steps

1. **Initialize Hardhat Project:**

   ```bash
   mkdir product-manager-project
   cd product-manager-project
   npm init -y
   npm install --save-dev hardhat
   npx hardhat
