// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SimpleSwap {
    error InsufficientInput();
    error InsufficientOutput();
    error SlippageExceeded();
    error TransferFailed();

    address public immutable tokenA;
    address public immutable tokenB;
    uint256 public reserveA;
    uint256 public reserveB;
    uint256 public constant FEE = 30; // 0.03% fee (30 basis points)
    uint256 public constant FEE_DENOMINATOR = 10000;

    constructor(address _tokenA, address _tokenB) {
        tokenA = _tokenA;
        tokenB = _tokenB;
    }

    function addLiquidity(uint256 amountA, uint256 amountB) external {
        IERC20(tokenA).transferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).transferFrom(msg.sender, address(this), amountB);
        reserveA += amountA;
        reserveB += amountB;
    }

    function swap(address inputToken, uint256 inputAmount, uint256 minOutput) external {
        bool isAToB = inputToken == tokenA;
        if (!isAToB && inputToken != tokenB) revert InsufficientInput();

        address outputToken = isAToB ? tokenB : tokenA;
        uint256 reserveIn = isAToB ? reserveA : reserveB;
        uint256 reserveOut = isAToB ? reserveB : reserveA;

        uint256 inputAmountWithFee = (inputAmount * (FEE_DENOMINATOR - FEE)) / FEE_DENOMINATOR;
        uint256 amountOut = (inputAmountWithFee * reserveOut) / (reserveIn + inputAmountWithFee);

        if (amountOut < minOutput) revert SlippageExceeded();
        if (amountOut == 0) revert InsufficientOutput();
        
        IERC20(inputToken).transferFrom(msg.sender, address(this), inputAmount);
        IERC20(outputToken).transfer(msg.sender, amountOut);
        
        reserveA = isAToB ? reserveA + inputAmountWithFee : reserveA - amountOut;
        reserveB = isAToB ? reserveB - amountOut : reserveB + inputAmountWithFee;
    }
}
