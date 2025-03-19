// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// import "./IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
contract Swap {
    address public tokenA;
    address public tokenB;

    uint256 public reserveA; // Tracks Token A in the contract
    uint256 public reserveB; // Tracks Token B in the contract

    event Swapped(address indexed user, uint256 amountIn, uint256 amountOut);

    constructor(address _tokenA, address _tokenB) {
        tokenA = _tokenA;
        tokenB = _tokenB;
    }

    function _updateReserves() private {
        reserveA = IERC20(tokenA).balanceOf(address(this));
        reserveB = IERC20(tokenB).balanceOf(address(this));
    }

    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256) {
        require(amountIn > 0, "Invalid input amount");
        require(reserveIn > 0 && reserveOut > 0, "Invalid reserves");

        uint256 amountInWithFee = amountIn * 997;  // Applying 0.3% fee
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;

        return numerator / denominator;
    }

    function swapTokenAToTokenB(uint256 amountIn) external {
        require(amountIn > 0, "Amount must be greater than zero");

        _updateReserves();
        require(reserveA >= amountIn, "Insufficient Token A in contract");

        uint256 amountOut = getAmountOut(amountIn, reserveA, reserveB);
        require(amountOut > 0, "Insufficient output amount");
        require(reserveB >= amountOut, "Insufficient liquidity");

        // Transfer Token A from user to contract
        require(IERC20(tokenA).transferFrom(msg.sender, address(this), amountIn), "Token A transfer failed");

        // Transfer Token B from contract to user
        require(IERC20(tokenB).transfer(msg.sender, amountOut), "Token B transfer failed");

        _updateReserves();

        emit Swapped(msg.sender, amountIn, amountOut);
    }
}
