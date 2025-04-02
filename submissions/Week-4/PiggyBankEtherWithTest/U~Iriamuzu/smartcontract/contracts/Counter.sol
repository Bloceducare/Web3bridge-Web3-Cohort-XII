// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

contract Counter {
  uint256 public count;

  event Incremented(uint256 value);

  function increment() external {
    count += 1;
    emit Incremented(count);
  }

  function decreseCount() external {
    require(count > 0, "Count cannot be less than 0");
    count -= 1;
  }
}