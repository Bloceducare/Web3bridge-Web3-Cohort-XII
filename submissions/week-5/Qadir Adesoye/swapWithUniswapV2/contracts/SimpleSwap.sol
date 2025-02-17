// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract SimpleSwap {
    using Math for uint256;

    address public token0;
    address public token1;
    uint256 public reserve0;
    uint256 public reserve1;
    uint256 private constant FEES_NUMERATOR = 997; // 100% - 0.3% = 99.7%
    uint256 private constant FEES_DENOMINATOR = 1000; // 100%

    event Swap(
        address indexed sender,
        uint256 amount0In,
        uint256 amount1In,
        uint256 amount0Out,
        uint256 amount1Out,
        address indexed to
    );
    // Add the LiquidityAdded event definition
    event LiquidityAdded(
        address indexed provider,
        uint256 amount0,
        uint256 amount1
    );

    constructor(address _token0, address _token1) {
        require(_token0 != address(0) && _token1 != address(0), "Invalid token address");
        token0 = _token0;
        token1 = _token1;
    }

    // Add initial liquidity to the pool
    function addLiquidity(uint256 amount0, uint256 amount1) external {
        require(amount0 > 0 && amount1 > 0, "Insufficient liquidity amount");
        
        IERC20(token0).transferFrom(msg.sender, address(this), amount0);
        IERC20(token1).transferFrom(msg.sender, address(this), amount1);
        
        reserve0 += amount0;
        reserve1 += amount1;

        // Emit the LiquidityAdded event
        emit LiquidityAdded(msg.sender, amount0, amount1);
    }

    // Calculate the amount of tokens to receive based on Uniswap V2 formula
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) 
        public 
        pure 
        returns (uint256)
    {
        require(amountIn > 0, "Insufficient input amount");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");

        // Calculate amount with 0.3% fee
        uint256 amountInWithFee = amountIn * FEES_NUMERATOR;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * FEES_DENOMINATOR) + amountInWithFee;
        
        return numerator / denominator;
    }

    // Swap token0 for token1
    function swap0For1(uint256 amount0In, uint256 minAmount1Out, address to) external {
        require(amount0In > 0, "Insufficient input amount");
        require(to != address(0), "Invalid recipient");

        uint256 amount1Out = getAmountOut(amount0In, reserve0, reserve1);
        require(amount1Out >= minAmount1Out, "Insufficient output amount");

        // Transfer tokens in
        IERC20(token0).transferFrom(msg.sender, address(this), amount0In);

        // Update reserves (Checks-Effects-Interactions)
        reserve0 += amount0In;
        reserve1 -= amount1Out;

        // Transfer tokens out
        IERC20(token1).transfer(to, amount1Out);

        emit Swap(msg.sender, amount0In, 0, 0, amount1Out, to);
    }

    // Swap token1 for token0
    function swap1For0(uint256 amount1In, uint256 minAmount0Out, address to) external {
        require(amount1In > 0, "Insufficient input amount");
        require(to != address(0), "Invalid recipient");

        uint256 amount0Out = getAmountOut(amount1In, reserve1, reserve0);
        require(amount0Out >= minAmount0Out, "Insufficient output amount");

        // Transfer tokens in
        IERC20(token1).transferFrom(msg.sender, address(this), amount1In);

        // Update reserves (Checks-Effects-Interactions)
        reserve1 += amount1In;
        reserve0 -= amount0Out;

        // Transfer tokens out
        IERC20(token0).transfer(to, amount0Out);

        emit Swap(msg.sender, 0, amount1In, amount0Out, 0, to);
    }

    // View functions
    function getReserves() public view returns (uint256, uint256) {
        return (reserve0, reserve1);
    }
}