## Simple Library Contract

# Overview
The Simple Library contract allows users to interact with a basic library system on the Ethereum blockchain. It enables the addition of books, borrowing, and returning of books, along with tracking the availability status of each book. The contract is intended to provide functionality for managing a simple library.

# Key Features
- Admin Functionality: Only the admin (deployer) can add new books to the library.
- Book Availability: Books can be borrowed if they are available. Once borrowed, they are marked as unavailable.
- Borrow and Return: Users can borrow and return books, but only the borrower can return a book.
- Book Status Check: Users can check if a specific book is available.

# Concepts Used
- Structs:
The Book struct holds information like book ID, book Name, and availability

- Mappings:
The hasBorrowed mapping keeps track of which users have borrowed which books.
The bookToBorrower mapping associates each book ID with the borrower’s address to ensure only the borrower can return the book.

- Modifiers:
The onlyAdmin modifier is used to restrict certain functions (e.g., addBook) to only the admin (the contract creator).

## GETTING STARTED
Before running this project, ensure you have the following installed:

[Node.js]
[MetaMask]

# INSTALLATION
Clone this repository and install dependencies:

- npm install
- npx hardhat ignition deploy ignition/modules/Lock.ts --network sepolia

# CONTRACT ADDRESS
- 0x15F797a1CE68b9b1923b37763eBeb573e8848e86
- ETH Sepolia Network.
