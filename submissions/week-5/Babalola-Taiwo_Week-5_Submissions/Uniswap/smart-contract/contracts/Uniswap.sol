// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Swap {
    using SafeERC20 for IERC20;
    address public tokenX;
    address public tokenY;

    event Swapped(address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut);

    error InvalidAmount();
    error InsufficientBalance();
    error NoLiquidity();
    error InvalidSwap();
    error InvalidAddress();
    error SwapFailed();

    constructor(address _tokenX, address _tokenY) {
        if (_tokenX == address(0) || _tokenY == address(0)) revert InvalidAddress();
        if (_tokenX == _tokenY) revert InvalidSwap();
        tokenX = _tokenX;
        tokenY = _tokenY;
    }

    function swap(
        address tokenIn,
        uint256 amountIn,
        address to
    ) external returns (uint256 amountOut) {
      
        if (amountIn == 0) revert InvalidAmount();
        if (to == address(0)) revert InvalidAddress();
        if (tokenIn != tokenX && tokenIn != tokenY) revert InvalidSwap();
        
      
        address tokenOut = tokenIn == tokenX ? tokenY : tokenX;
        
  
        if (IERC20(tokenIn).balanceOf(msg.sender) < amountIn) revert InsufficientBalance();
        uint256 reserveIn = IERC20(tokenIn).balanceOf(address(this));
        uint256 reserveOut = IERC20(tokenOut).balanceOf(address(this));
        if (reserveIn == 0 || reserveOut == 0) revert NoLiquidity();

      
        uint256 amountInWithFee = amountIn * 997; // 0.3% fee
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;
        amountOut = numerator / denominator;
        
        if (amountOut == 0) revert SwapFailed();

        // Execute swap
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenOut).safeTransfer(to, amountOut);

        emit Swapped(tokenIn, tokenOut, amountIn, amountOut);
    }


    function addLiquidity(uint256 amountX, uint256 amountY) external {
        if (amountX == 0 || amountY == 0) revert InvalidAmount();
        
        IERC20(tokenX).safeTransferFrom(msg.sender, address(this), amountX);
        IERC20(tokenY).safeTransferFrom(msg.sender, address(this), amountY);
    }
}