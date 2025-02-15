// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

contract Counter {

    uint256 public count;

    function increaseCount () external {
        count += 1;
    }

    function decreaseCount () external {
        require(count > 0, 'COUNT SHOULD BE GREATER');

        count -= 1;
    }
}