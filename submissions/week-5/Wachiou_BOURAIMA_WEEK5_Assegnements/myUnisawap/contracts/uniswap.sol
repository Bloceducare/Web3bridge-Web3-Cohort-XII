// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC20Token.sol";
import "./mathLib.sol";

error INVALID_TOKEN(uint256 get, uint256 expected);
error INVALID_AMOUNT(uint256 get, uint256 expected);

contract SimpleUniswap {
    ERC20Token public tokenA;
    ERC20Token public tokenB;
    uint256 public reserveA;
    uint256 public reserveB;
    uint256 public totalReserve;

    event Swap(address indexed user, address indexed tokenIn, uint256 amountIn, address indexed tokenOut, uint256 amountOut);
    event AddLiquidity(address indexed user, uint256 amountA, uint256 amountB);
    event RemoveLiquidity(address indexed user, uint256 amountA, uint256 amountB);

    constructor(address tokenAddressA, address tokenAddressB) {
        tokenA =  ERC20Token(tokenAddressA);
        tokenB = ERC20Token(tokenAddressB);
    }

    function addLiquidity(uint256 amountA, uint256 amountB) external {
        require(amountA > 0 && amountB > 0, "Invalid amounts");

        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);

        reserveA += amountA;
        reserveB += amountB;

        totalReserve = reserveA + reserveB;

        emit AddLiquidity(msg.sender, amountA, amountB);
    }

    function removeLiquidity(uint256 amountA, uint256 amountB) external {
        require(amountA > 0 && amountB > 0, "Invalid amounts");
        require(amountA <= reserveA && amountB <= reserveB, "Insufficient liquidity");

        reserveA -= amountA;
        reserveB -= amountB;

        tokenA.transfer(msg.sender, amountA);
        tokenB.transfer(msg.sender, amountB);

        totalReserve = reserveA + reserveB;

        emit RemoveLiquidity(msg.sender, amountA, amountB);
    }

    function swap(address tokenIn, uint256 amountIn) external {
        require(amountIn > 0, "Invalid amount");

        bool isTokenA = tokenIn == address(tokenA);
        require(isTokenA || tokenIn == address(tokenB), "Invalid token");

        ERC20Token inputToken = isTokenA ? tokenA : tokenB;
        ERC20Token outputToken = isTokenA ? tokenB : tokenA;
        uint256 inputReserve = isTokenA ? reserveA : reserveB;
        uint256 outputReserve = isTokenA ? reserveB : reserveA;

        inputToken.transferFrom(msg.sender, address(this), amountIn);

        uint256 amountOut = getAmountOut(amountIn, inputReserve, outputReserve);

        if (isTokenA) {
            reserveA += amountIn;
            reserveB -= amountOut;
        } else {
            reserveB += amountIn;
            reserveA -= amountOut;
        }

        outputToken.transfer(msg.sender, amountOut);

        MathLib.solveForY(amountIn, totalReserve);
        emit Swap(msg.sender, tokenIn, amountIn, address(outputToken), amountOut);
    }

    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256) {
        require(amountIn > 0, "Invalid input amount");
        require(reserveIn > 0 && reserveOut > 0, "Invalid reserves");

        uint256 amountInWithFee = amountIn * 997;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;
        return numerator / denominator;
    }
}