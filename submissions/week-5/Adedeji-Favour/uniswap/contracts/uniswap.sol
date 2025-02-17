// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Uniswap is Ownable {
    IERC20 public tokenA;
    IERC20 public tokenB;
    
    uint256 public reserveA;
    uint256 public reserveB;
    
    uint256 private constant FEE_PERCENT = 3;
    uint256 private constant FEE_DENOMINATOR = 1000;

    event LiquidityAdded(address indexed provider, uint256 amountA, uint256 amountB);
    event Swap(address indexed user, address tokenIn, uint256 amountIn, uint256 amountOut);

    constructor(address _tokenA, address _tokenB) Ownable(msg.sender) {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    function addLiquidity(uint256 amountA, uint256 amountB) external {
        require(amountA > 0 && amountB > 0, "Invalid amounts");

        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);

        reserveA += amountA;
        reserveB += amountB;

        emit LiquidityAdded(msg.sender, amountA, amountB);
    }

    function swapAForB(uint256 amountIn) external returns (uint256 amountOut) {
        require(amountIn > 0, "Amount must be greater than zero");

        uint256 amountInWithFee = (amountIn * (FEE_DENOMINATOR - FEE_PERCENT)) / FEE_DENOMINATOR;
        amountOut = (reserveB * amountInWithFee) / (reserveA + amountInWithFee);

        require(amountOut > 0, "Insufficient output amount");

        reserveA += amountIn;
        reserveB -= amountOut;

        tokenA.transferFrom(msg.sender, address(this), amountIn);
        tokenB.transfer(msg.sender, amountOut);

        emit Swap(msg.sender, address(tokenA), amountIn, amountOut);
    }

    function swapBForA(uint256 amountIn) external returns (uint256 amountOut) {
        require(amountIn > 0, "Amount must be greater than zero");

        uint256 amountInWithFee = (amountIn * (FEE_DENOMINATOR - FEE_PERCENT)) / FEE_DENOMINATOR;
        amountOut = (reserveA * amountInWithFee) / (reserveB + amountInWithFee);

        require(amountOut > 0, "Insufficient output amount");

        reserveB += amountIn;
        reserveA -= amountOut;

        tokenB.transferFrom(msg.sender, address(this), amountIn);
        tokenA.transfer(msg.sender, amountOut);

        emit Swap(msg.sender, address(tokenB), amountIn, amountOut);
    }

    function getPriceAinB() public view returns (uint256) {
        require(reserveA > 0 && reserveB > 0, "No liquidity");
        return (reserveB * 1e18) / reserveA;
    }

    function getPriceBinA() public view returns (uint256) {
        require(reserveA > 0 && reserveB > 0, "No liquidity");
        return (reserveA * 1e18) / reserveB;
    }
}
