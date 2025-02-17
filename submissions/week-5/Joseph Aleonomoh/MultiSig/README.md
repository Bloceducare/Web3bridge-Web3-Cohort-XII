# MultiSig Token Management System

A Solidity-based multi-signature token management system that enables controlled token operations through board member consensus. The system consists of a custom ERC20 token and a multi-signature governance contract.

## Features

- **Board Member Governance**: Requires approval from 20 board members for transaction execution
- **Token Management**: Custom ERC20 token with minting capabilities
- **Transaction Security**: Multi-signature requirement for all token transfers
- **Liquidity Management**: Board members can add liquidity to the contract
- **Transaction Tracking**: Comprehensive transaction logging with timestamps

## Smart Contracts

### Token.sol
An ERC20-compliant token contract with the following features:
- Customizable name and symbol
- Minting capabilities (restricted to owner)
- Built on OpenZeppelin's ERC20 implementation

### MultiSig.sol
A multi-signature governance contract that manages token operations:
- Requires 20 board member signatures for transaction execution
- Tracks transaction status and signatures
- Manages liquidity deposits
- Enforces security checks and validations

### IToken.sol
Interface contract defining the token interaction methods.

## Technical Details

### Prerequisites
- Solidity ^0.8.28
- OpenZeppelin Contracts
- Hardhat development environment

### Key Constants
- `THRESHOLD`: 20 (required number of board member signatures)
- Supported by comprehensive test suite

## Contract Interactions

### Transaction Flow
1. Board member initiates transaction
2. Other board members sign the transaction
3. Transaction automatically executes when signature threshold is reached

### Key Functions

#### MultiSig Contract
```solidity
function initiateTransaction(address _destination, uint256 _amount) external returns (uint256)
function signTransaction(uint256 _txid) public returns (bool)
function addLiquidity(uint256 _amount) external returns (bool)
```

#### Token Contract
```solidity
function mint(address _to, uint256 _value) external returns (bool)
```

## Events

The system emits the following events:
- `TransactionEvent`: When a new transaction is initiated
- `SignTransactionEvent`: When a transaction is signed
- `TansactionExecutedEvent`: When a transaction is executed
- `LiquidityAddedEvent`: When liquidity is added

## Error Handling

Custom errors are implemented for various failure scenarios:
- `IncompleteBoardMembers`
- `Unathourized`
- `AlreadyExist`
- `Invalid`
- `InvalidAmount`
- `InvalidSignature`
- `AlreadySigned`
- `InvalidExecution`
- `InsufficientFunds`
- `InsufficientAllowance`

## Testing

The project includes a comprehensive test suite covering:
- Contract deployment
- Board member management
- Transaction initiation and signing
- Liquidity management
- Transaction execution
- Error scenarios

Run tests using:
```bash
npx hardhat test
```
