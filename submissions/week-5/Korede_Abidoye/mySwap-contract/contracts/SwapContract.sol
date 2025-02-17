// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SwapContract {
    IERC20 public tokenX;
    IERC20 public tokenY;
    uint public reserveX;
    uint public reserveY;
    event Swap(address indexed user, uint amountXIn, uint amountYOut);

    constructor(address _tokenX, address _tokenY) {
        tokenX = IERC20(_tokenX);
        tokenY = IERC20(_tokenY);
    }

    function addLiquidity(uint _amountX, uint _amountY) external {
        bool successX = tokenX.transferFrom(msg.sender, address(this), _amountX);
        bool successY = tokenY.transferFrom(msg.sender, address(this), _amountY);
        
        if (successX && successY) {
            reserveX += _amountX;
            reserveY += _amountY;
        } else {
            // Handle the error, perhaps revert with a custom message
            revert("Liquidity addition failed");
        }
    }

    function getAmountYForX(uint _amountX) public view returns (uint) {
        uint k = reserveX * reserveY;
        uint newReserveX = reserveX + _amountX;
        uint newReserveY = k / newReserveX;
        return reserveY - newReserveY;
    }

    function swap(uint _amountXIn) external {
        uint amountYOut = getAmountYForX(_amountXIn);
        
        bool transferXSuccess = tokenX.transferFrom(msg.sender, address(this), _amountXIn);
        bool transferYSuccess = tokenY.transfer(msg.sender, amountYOut);

        if (transferXSuccess && transferYSuccess) {
            reserveX += _amountXIn;
            reserveY -= amountYOut;
            emit Swap(msg.sender, _amountXIn, amountYOut);
        } else {
            // Handle the error, perhaps revert with a custom message
            revert("Swap failed");
        }
    }
}