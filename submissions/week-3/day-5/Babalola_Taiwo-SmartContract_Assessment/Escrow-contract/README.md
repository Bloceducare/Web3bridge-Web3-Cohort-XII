Escrow Smart Contract System
This project implements a decentralized escrow system using Solidity smart contracts. The system allows buyers and sellers to safely conduct transactions with funds held in escrow until both parties confirm the successful completion of the trade.

Contract Address: 0x293E6327c7e65aDe95675563Da0C2e49CCF43485

Smart Contract Implementation
Data Types Used

address payable: For buyer and seller addresses
uint256: For transaction amounts and IDs
bool: For transaction state flags
string: For item descriptions
struct: To organize transaction data
mapping: To store transactions by ID

Key Components

Constructor

Initializes the contract owner
Sets up initial state


Modifiers

onlyBuyer: Restricts function access to the transaction buyer
onlySeller: Restricts function access to the transaction seller
validState: Validates transaction state before execution


Functions

createTransaction: Creates new escrow transaction
deposit: Allows buyer to deposit funds
confirmReceipt: Releases funds to seller
raiseDispute: Initiates dispute process
refund: Returns funds to buyer


Error Handling

Custom errors for invalid amounts, unauthorized access, and state violations
Require statements for input validation
Event emission for tracking transaction state changes
