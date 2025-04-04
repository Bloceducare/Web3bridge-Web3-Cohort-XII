// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IToken} from "./interfaces/IToken.sol";
import "./library/Math.sol";

contract Swap {
    address public tokenA;
    address public tokenB;
    using SwapMath for uint256;


    constructor(address _tokenA, address _tokenB) {
        if(_tokenA == address(0) && _tokenB == address(0)) revert InvalidAddress();
        tokenA = _tokenA;
        tokenB = _tokenB;
    }


    function swapToken(uint256 _amount, address tokenAddress) external {
        IToken _tokenA = IToken(tokenA);
        IToken _tokenB = IToken(tokenB);
        uint256 reserveA = _tokenA.balanceOf(address(this));
        uint256 reserveB = _tokenB.balanceOf(address(this));
        uint256 amount = _amount;
        uint256 fees = (amount * 3)/1000;
        if(tokenAddress == tokenA){
            uint256 amountB = amount.calculateSwapAmount(reserveA, reserveB, fees);
            _tokenA.transferFrom(msg.sender, address(this), amount);
            _tokenB.transfer(msg.sender, amountB); 
        } else if(tokenAddress == tokenB) {
            uint256 amountA = amount.calculateSwapAmount(reserveB, reserveA, fees);
            _tokenB.transferFrom(msg.sender, address(this), amount);
            _tokenA.transfer(msg.sender, amountA);
        } else {
            revert InvalidSwap();
            }
        
    }

    function priceOfToken(address tokenAddress) external view returns(uint256) {
        IToken _tokenA = IToken(tokenA);
        IToken _tokenB = IToken(tokenB);
        uint256 reserveA = _tokenA.balanceOf(address(this));
        uint256 reserveB = _tokenB.balanceOf(address(this));
        if(tokenAddress == tokenA){
            return reserveB / reserveA;
        } else if(tokenAddress == tokenB) {
            return reserveA / reserveB;
        } else {
            revert InvalidSwap();
        }
    }
}