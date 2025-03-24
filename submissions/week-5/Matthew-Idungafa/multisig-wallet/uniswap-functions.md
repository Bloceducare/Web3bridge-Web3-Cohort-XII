# Understanding Key Uniswap V2 Router Functions

## Introduction
This document provides a detailed explanation of the main functions in Uniswap's V2 Router smart contract. These functions enable users to trade tokens, provide liquidity, and interact with the Uniswap decentralized exchange.

## 1. swapExactTokensForTokens()
### Purpose
This function allows you to swap a specific amount of one token for another token.

### Function Signature
```solidity 
function swapExactTokensForTokens(
    uint amountIn,
    uint amountOutMin,
    address[] calldata path,
    address to,
    uint deadline
) external returns (uint[] memory amounts)
```
### How It Works
1. You specify exactly how many tokens you want to swap (amountIn)
2. You set a minimum amount of tokens you want to receive (amountOutMin)
3. The function:
   - Calculates the expected output amount using price reserves
   - Transfers your input tokens to the first pair contract
   - Executes the swap through the specified path
   - Ensures you receive at least your minimum specified amount
   - Returns an array of amounts for each step in the path

### Example Usage
If you want to swap 100 USDC for DAI:
- amountIn: 100 USDC (in USDC's decimal format)
- amountOutMin: 98 DAI (accepting 2% slippage)
- path: [USDC address, DAI address]
- to: Your wallet address
- deadline: Current time + 20 minutes

## 2. swapTokensForExactTokens()
### Purpose
This function lets you specify exactly how many tokens you want to receive, rather than how many you want to spend.

### Function Signature
```solidity
function swapTokensForExactTokens(
    uint amountOut,
    uint amountInMax,
    address[] calldata path,
    address to,
    uint deadline
) external returns (uint[] memory amounts)
```

### How It Works
1. You specify exactly how many tokens you want to receive (amountOut)
2. You set a maximum amount you're willing to spend (amountInMax)
3. The function:
   - Calculates the required input amount
   - Verifies it doesn't exceed your maximum
   - Transfers the required input tokens
   - Executes the swap
   - Returns the actual amounts used/received

### Example Usage
If you want exactly 1000 DAI:
- amountOut: 1000 DAI
- amountInMax: 1020 USDC (allowing for up to 2% slippage)
- path: [USDC address, DAI address]
- to: Your wallet address
- deadline: Current time + 20 minutes

## 3. addLiquidity()
### Purpose
This function allows you to provide liquidity to a trading pair, earning fees from trades.

### Function Signature
```solidity
function addLiquidity(
    address tokenA,
    address tokenB,
    uint amountADesired,
    uint amountBDesired,
    uint amountAMin,
    uint amountBMin,
    address to,
    uint deadline
) external returns (uint amountA, uint amountB, uint liquidity)
```

### How It Works
1. You specify two tokens and the amounts you want to provide
2. The function:
   - Creates the pair if it doesn't exist
   - Calculates the optimal amounts based on current reserves
   - Ensures amounts meet your minimum requirements
   - Transfers tokens to the pair contract
   - Mints and returns liquidity tokens representing your share

### Example Usage
Adding liquidity to ETH/USDC pair:
- tokenA: ETH address
- tokenB: USDC address
- amountADesired: 1 ETH
- amountBDesired: 1800 USDC
- amountAMin: 0.98 ETH (2% slippage tolerance)
- amountBMin: 1764 USDC (2% slippage tolerance)
- to: Your wallet address
- deadline: Current time + 20 minutes

## 4. removeLiquidity()
### Purpose
This function allows you to withdraw your liquidity from a pool and receive back the underlying tokens.

### Function Signature
```solidity
function removeLiquidity(
    address tokenA,
    address tokenB,
    uint liquidity,
    uint amountAMin,
    uint amountBMin,
    address to,
    uint deadline
) external returns (uint amountA, uint amountB)
```

### How It Works
1. You specify how much liquidity you want to withdraw
2. The function:
   - Burns your liquidity tokens
   - Calculates your share of the pool
   - Returns both tokens to you
   - Ensures you receive at least your minimum specified amounts

### Example Usage
Removing liquidity from ETH/USDC pair:
- tokenA: ETH address
- tokenB: USDC address
- liquidity: Your LP token amount
- amountAMin: Minimum ETH expected
- amountBMin: Minimum USDC expected
- to: Your wallet address
- deadline: Current time + 20 minutes

## 5. swapExactETHForTokens()
### Purpose
This function allows you to buy tokens using ETH, specifying exactly how much ETH you want to spend.

### Function Signature
```solidity
function swapExactETHForTokens(
    uint amountOutMin,
    address[] calldata path,
    address to,
    uint deadline
) external payable returns (uint[] memory amounts)
```

### How It Works
1. You send ETH with the transaction (msg.value)
2. The function:
   - Wraps your ETH into WETH 
   - Calculates the output amount 
   - Executes the swap through the path 
   - Ensures you receive at least your minimum specified tokens 
   - Returns actual amounts for each step


### Example Usage
Buying USDC with 1 ETH:
- amountOutMin: 1764 USDC (accepting 2% slippage)
- path: [WETH address, USDC address]
- to: Your wallet address
- deadline: Current time + 20 minutes
- Send 1 ETH with transaction

## 6. swapExactTokensForETH()
### Purpose
This function allows you to sell tokens for ETH, specifying exactly how many tokens you want to sell.

### Function Signature
```solidity
function swapExactTokensForETH(
    uint amountIn,
    uint amountOutMin,
    address[] calldata path,
    address to,
    uint deadline
) external returns (uint[] memory amounts)
```

### How It Works
1. You specify exactly how many tokens you want to sell
2. The function:
   - Transfers your tokens to the first pair
   - Executes the swap through the path
   - Unwraps the WETH back to ETH
   - Sends the ETH to your address
   - Ensures you receive at least your minimum specified ETH

### Example Usage
Selling 1800 USDC for ETH:
- amountIn: 1800 USDC
- amountOutMin: 0.98 ETH (accepting 2% slippage)
- path: [USDC address, WETH address]
- to: Your wallet address
- deadline: Current time + 20 minutes

## Important Concepts

### Slippage
Slippage is the difference between expected and actual prices when your transaction is processed. You control this by setting minimum output amounts (amountOutMin) or maximum input amounts (amountInMax).

### Path
The path is an array of token addresses showing how to route your trade. For direct swaps, it contains just the input and output token addresses. For more complex routes (e.g., USDC → WETH → DAI), it contains all intermediate tokens.

### Deadline
The deadline parameter protects you from delayed transactions. If the transaction isn't processed before the deadline, it will revert. Typically set to current time + several minutes.

### WETH (Wrapped ETH)
When trading with ETH, Uniswap automatically handles wrapping/unwrapping ETH to/from WETH. WETH is the ERC20 token version of ETH used in the actual trades.

## Safety Tips
1. Always set reasonable slippage tolerances (usually 0.5% to 2%)
2. Use reasonable deadlines (5-20 minutes)
3. Double-check token addresses to avoid scam tokens
4. Verify expected output amounts before confirming transactions
5. Ensure you have enough ETH for gas fees