// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.28;

contract Counter{
     //state variable
     uint256 public count;

     function increaseCount () external{
          count +=1;
     }

     function decreaseCount () external{
          require(count > 0, 'count is zero');
          count -=1;
     }
}