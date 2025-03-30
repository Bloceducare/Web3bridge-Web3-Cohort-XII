# Qadir Adesoye SimpleSwap Smart Contract

## Overview
The `SimpleSwap` contract is a decentralized token swap mechanism that allows users to swap between two ERC-20 tokens with an automated liquidity pool. It uses a constant product market maker formula similar to Uniswap V2 and includes a 0.3% fee on swaps.

## Features
- **Liquidity Provision:** Users can add liquidity to the pool by depositing both tokens in equal proportion.
- **Swaps:** Users can swap `token0` for `token1` and vice versa, following the constant product formula.
- **Reserves Management:** Keeps track of token reserves to maintain the swapping mechanism.
- **Events:**
  - `LiquidityAdded`: Emitted when liquidity is added.
  - `Swap`: Emitted when a swap occurs.

## Contract Details
- **Compiler Version:** `^0.8.28`
- **License:** MIT
- **Dependencies:**
  - `IERC20.sol` for ERC-20 token interactions.
  - OpenZeppelin's `Math` library for safe mathematical operations.

## Functions
### Constructor
```solidity
constructor(address _token0, address _token1)
```
Initializes the contract with two ERC-20 token addresses.

### addLiquidity
```solidity
function addLiquidity(uint256 amount0, uint256 amount1) external
```
Allows users to add liquidity to the pool by depositing both tokens.

### getAmountOut
```solidity
function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256)
```
Calculates the output token amount based on the Uniswap V2 formula with a 0.3% fee.

### swap0For1
```solidity
function swap0For1(uint256 amount0In, uint256 minAmount1Out, address to) external
```
Swaps `token0` for `token1`, ensuring a minimum output amount.

### swap1For0
```solidity
function swap1For0(uint256 amount1In, uint256 minAmount0Out, address to) external
```
Swaps `token1` for `token0`, ensuring a minimum output amount.

### getReserves
```solidity
function getReserves() public view returns (uint256, uint256)
```
Returns the current reserves of `token0` and `token1` in the liquidity pool.

## Fees
- A **0.3% trading fee** is deducted from the input amount before computing the output amount.
- The fee ensures sustainable liquidity incentives.

## Security Considerations
- **Reentrancy Protections:** The contract follows the Checks-Effects-Interactions pattern.
- **ERC-20 Compliance:** Uses `IERC20.transferFrom` to handle token transfers securely.
- **Input Validation:** Ensures sufficient liquidity and valid swap amounts before execution.

## License
This project is licensed under the MIT License.

