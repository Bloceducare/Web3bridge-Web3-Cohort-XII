// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Swap {
    using SafeERC20 for IERC20;

    address public tokenX;
    address public tokenY;
    uint256 public reserveX;
    uint256 public reserveY;
    
    uint256 private constant FEE_NUMERATOR = 997; // 0.3% fee (997/1000)
    uint256 private constant FEE_DENOMINATOR = 1000;

    event Swapped(address indexed from, address indexed tokenIn, uint256 amountIn, uint256 amountOut);
    event LiquidityAdded(address indexed provider, uint256 amountX, uint256 amountY);

    error InvalidAmount();
    error InsufficientLiquidity();
    error SwapFailed();

    constructor(address _tokenX, address _tokenY) {
        tokenX = _tokenX;
        tokenY = _tokenY;
    }

    function swap(address tokenIn, uint256 amountIn) external {
        if (amountIn == 0) revert InvalidAmount();
        if (tokenIn != tokenX && tokenIn != tokenY) revert InvalidAmount();

        bool isTokenX = tokenIn == tokenX;
        address tokenOut = isTokenX ? tokenY : tokenX;

        uint256 reserveIn = isTokenX ? reserveX : reserveY;
        uint256 reserveOut = isTokenX ? reserveY : reserveX;

        if (reserveIn == 0 || reserveOut == 0) revert InsufficientLiquidity();

        // Apply Uniswap V2 fee (0.3%)
        uint256 amountInWithFee = (amountIn * FEE_NUMERATOR) / FEE_DENOMINATOR;
        
        // Calculate amountOut using Uniswap V2 formula with fee
        uint256 amountOut = (reserveOut * amountInWithFee) / (reserveIn + amountInWithFee);
        if (amountOut == 0) revert SwapFailed();

        // Transfer tokenIn from sender to contract
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        
        // Transfer tokenOut from contract to sender
        IERC20(tokenOut).safeTransfer(msg.sender, amountOut);

        // Update reserves
        if (isTokenX) {
            reserveX += amountIn;
            reserveY -= amountOut;
        } else {
            reserveY += amountIn;
            reserveX -= amountOut;
        }

        emit Swapped(msg.sender, tokenIn, amountIn, amountOut);
    }

    function addLiquidity(uint256 amountX, uint256 amountY) external {
        IERC20(tokenX).safeTransferFrom(msg.sender, address(this), amountX);
        IERC20(tokenY).safeTransferFrom(msg.sender, address(this), amountY);

        reserveX += amountX;
        reserveY += amountY;

        emit LiquidityAdded(msg.sender, amountX, amountY);
    }
}
    