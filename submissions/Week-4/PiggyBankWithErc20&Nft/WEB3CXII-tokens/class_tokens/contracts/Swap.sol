// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import "./IErc20.sol";

contract Swap {

    address public tokenA;
    address public tokenB;

    constructor (address _tokenA, address _tokenB) {
        tokenA = _tokenA;
        tokenB = _tokenB;
    }

    function swapTokenAToTokenB (uint256 _amount) public {
        require(_amount > 0, "AMOUNT TO SMALL");

       uint256 balOfA = IERC20(tokenA).balanceOf(msg.sender);
       uint256 balOfContractInB = IERC20(tokenB).balanceOf(address(this));

       require (balOfA >= _amount, 'YOU DONT HAVE FUNDS');
       require (balOfContractInB >= _amount, 'NO FUNDS IN CONTRACT');
    }

    require(IERC20(tokenA).transferFrom(msg.sender, address(this), _amount),'TRANSFER_FROM NOT SUCCESSFUL');

    IERC20(tokenB).transfer(recipient, amount);

    
}
