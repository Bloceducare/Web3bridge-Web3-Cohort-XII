// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

library MathLib {
    function solveForY(uint256 x, uint256 k) internal pure returns (uint256) {
        require(x != 0, "x cannot be zero");
        return k / x;
    }

    function solveForX(uint256 y, uint256 k) internal pure returns (uint256) {
        require(y != 0, "y cannot be zero");
        return k / y;
    }
}