// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

error InsufficientAmount();
error InsufficientLiquidity();
error InsufficientBalance();
error InvalidSwap();
error InvalidAddress();

library SwapMath{

    uint256 constant DECIMALS_SCALE = 1e18;

    function calculateSwapAmount(uint256 _amountA, uint256 reserveA, uint256 reserveB, uint256 fees) internal pure returns (uint256) {
        if(_amountA < 0) revert InsufficientAmount();
        if(reserveA < 0 && reserveB < 0) revert InsufficientLiquidity();

       uint256 amountA = _amountA - fees;
        
        uint256 k = reserveA * reserveB;
        uint256 newReserveA = reserveA + amountA;
        uint256 newReserveB = k / newReserveA;

        uint256 amountB = reserveB - newReserveB;
        if ((reserveA * reserveB) <= ((newReserveA * (reserveB - amountB)))) {
            revert InvalidSwap();
        }
        if (amountB >= reserveB) revert InsufficientLiquidity();
        
        return amountB;
    }

    
}