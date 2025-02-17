// // SPDX-License-Identifier: UNLICENSED
// pragma solidity 0.8.28;

// import "./IErc20.sol";

// contract Swap {
//     address public tokenA;
//     address public tokenB;

//     constructor(address _tokenA, address _tokenB) {
//         tokenA = _tokenA;
//         tokenB = _tokenB;
//     }

//     function swapTokenAToTokenB(uint256 _amount) public {
//         if (_amount <= 0) {
//             revert("AMOUNT TOO SMALL");
//         }

//         uint256 balOfA = IERC20(tokenA).balanceOf(msg.sender);
//         uint256 balOfContractInB = IERC20(tokenB).balanceOf(address(this));

//         if (balOfA < _amount) {
//             revert("YOU DONT HAVE FUNDS");
//         }

//         if (balOfContractInB < _amount) {
//             revert("NO FUNDS IN CONTRACT");
//         }

//         bool success = IERC20(tokenA).transferFrom(msg.sender, address(this), _amount);
//         if (!success) {
//             revert("TRANSFER_FROM NOT SUCCESSFUL");
//         }

//         IERC20(tokenB).transfer(msg.sender, _amount);
//     }
// }





















