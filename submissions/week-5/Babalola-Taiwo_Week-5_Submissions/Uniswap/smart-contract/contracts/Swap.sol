// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { IToken } from "./IERC20.sol";


error InsufficientAmount();
error InsufficientLiquidity();
error InsufficientBalance();
error InvalidSwap();
error InvalidAddress();

contract Swap {
    address public tokenX;
    address public tokenY;
    uint256 public reserveX;
    uint256 public reserveY;
    uint256 public constant FEE = 3;

    event LiquidityAdded(address indexed provider, uint256 amountX, uint256 amountY);
    event Swapped(address indexed user, address indexed fromToken, uint256 amountIn, uint256 amountOut);

    constructor(address _tokenX, address _tokenY) {
        if(_tokenX == address(0) && _tokenY == address(0)) revert InvalidAddress();
        tokenX = _tokenX;
        tokenY = _tokenY;
    }

    function addLiquidity(uint256 amountX, uint256 amountY) external {
        IToken(tokenX).transferFrom(msg.sender, address(this), amountX);
        IToken(tokenY).transferFrom(msg.sender, address(this), amountY);
        reserveX += amountX;
        reserveY += amountY;
        emit LiquidityAdded(msg.sender, amountX, amountY);
    }

    function swapXforY(uint256 amountX) external returns (uint256 amountY) {
        if(amountX == 0) revert InsufficientAmount();

        uint256 amountXwithFee = (amountX * (1000 - FEE)) / 1000;
	
        amountY = (reserveY * amountXwithFee) / (reserveX + amountXwithFee);
        if(amountY == 0 || amountY >= reserveY) revert InsufficientLiquidity();

        IToken(tokenX).transferFrom(msg.sender, address(this), amountX);
        IToken(tokenY).transfer(msg.sender, amountY);

        reserveX += amountXwithFee;
        reserveY -= amountY;

        emit Swapped(msg.sender, tokenX, amountX, amountY);
    }
	
    function swapYforX(uint256 amountY) external returns (uint256 amountX) {
        if(amountY == 0) revert InsufficientAmount();

        uint256 amountYwithFee = (amountY * (1000 - FEE)) / 1000;

        amountX = (reserveX * amountYwithFee) / (reserveY + amountYwithFee);
        if(amountX < 0 || amountX >= reserveX) revert InsufficientLiquidity();

        IToken(tokenY).transferFrom(msg.sender, address(this), amountY);
        IToken(tokenX).transfer(msg.sender, amountX);

        reserveY += amountYwithFee;
        reserveX -= amountX;

        emit Swapped(msg.sender, tokenY, amountY, amountX);
    }
}